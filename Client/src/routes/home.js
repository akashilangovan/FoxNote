import React, { useState, useEffect, useMemo } from 'react';
import RecordRTC, {StereoAudioRecorder} from 'recordrtc';
import { Outlet, Link} from "react-router-dom";
import "../App.css"
import {EditorState, BlockMapBuilder, ContentBlock, RichUtils, SelectionState, Modifier, ContentState} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Slate, Editable, withReact } from 'slate-react'
import RichTextEditor from '../editor';
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
} from 'slate'
import { withHistory } from 'slate-history'

// import {toggleBlockType} from RichUtils;
// import Immutable from "immutable.js"

// const blockRenderMap = Immutable.Map({
//   'header-two': {
//     element: 'h2'
//   },
//   'unstyled': {
//     element: 'ul'
//   }
// });

const bulletItem = "unordered-list-item";

const Home = () => {
  const [startpauseIcon, setStartpauseIcon] = React.useState("start");
  const [restart, setRestart] = useState(false)
  const [stopRecording, setStopRecording] = useState(true)
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  let isRecording = false;
  let socket;
  let recorder;
  let seenAudioEndTimes = []
  let msgBuffer = ''

  useEffect(() => {
    console.log("Running record")
    if (stopRecording) { 
      if (socket) {
        socket.send(JSON.stringify({terminate_session: true}));
        socket.close();
        socket = null;
      }
  
      if (recorder) {
        recorder.pauseRecording();
        recorder = null;
      }
    } else {
      const startSocket = async () => {
        const tkResponse = await fetch('http://localhost:8000/token/'); // get temp session token from server.js (backend)
        const data = await tkResponse.json();
        
        console.log("Trying to start new stream")
        socket = await new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${data['token']}`);
        console.log("Started new stream")

        const texts = {};
        socket.onmessage = (message) => {
          const res = JSON.parse(message.data);
          console.log(res)
          if (res.message_type == "FinalTranscript") {
            texts[res.audio_start] = res.text;
            const keys = Object.keys(texts);
            keys.sort((a, b) => a - b);
            for (const key of keys) {
              if (key in seenAudioEndTimes) {
              } else {
                seenAudioEndTimes.push(key)
                if (texts[key]) {
                  msgBuffer = msgBuffer + " " + texts[key]
                }
              }
            }
            while (msgBuffer.split(".").length > 6) {
              console.log(msgBuffer)
              message = msgBuffer.split(".").slice(0, 6).join(".")
              let dataObj = {"transcript": message}
              fetch("http://localhost:8000/summarize/?transcript=" + encodeURIComponent(message), {
                method: "GET"
              }).then(res => {
                return res.json()
              }).then(data => {
                console.log(data)
                updateLiveTranscript(data.text)
              });
              msgBuffer = msgBuffer.split(".").slice(6).join(".")
              console.log(msgBuffer.length)
            }
          }
        }

        socket.onerror = (event) => {
          console.error(event);
          socket.close();
          if (event.error = "Audio duration is too long") {
            setRestart(!restart)
          }
          isRecording = false;
        }
        
        socket.onclose = event => {
          console.log(event);
          socket = null;
          isRecording = false;
        }

        socket.onopen = () => {
          // once socket is open, begin recording
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
              recorder = new RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm;codecs=pcm', // endpoint requires 16bit PCM audio
                recorderType: StereoAudioRecorder,
                timeSlice: 1250, // set 250 ms intervals of data that sends to AAI
                desiredSampRate: 16000,
                numberOfAudioChannels: 1, // real-time requires only one channel
                bufferSize: 4096,
                audioBitsPerSecond: 128000,
                ondataavailable: (blob) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const base64data = reader.result;
                    // audio data must be sent as a base64 encoded string
                    if (socket) {
                      socket.send(JSON.stringify({ audio_data: base64data.split('base64,')[1] }));
                    }
                  };
                  reader.readAsDataURL(blob);
                },
              });
    
              recorder.startRecording();
            })
            .catch((err) => console.error(err));
        };
      }
      isRecording = true;
      startSocket()
    }
  }, [restart, stopRecording])

  function doStartPause() {
    if (startpauseIcon == "start") {
      document.getElementById("start").id="pause";
      setStartpauseIcon("pause");
      setStopRecording(false)
    } else {
      document.getElementById("pause").id="start";
      setStartpauseIcon("start");
      setStopRecording(true)
    }
  }

  const [liveTranscript, setLiveTranscript] = React.useState("He today. We're starting a new chapter, chapter four, about the time value of money, which is something that we tal");
  function updateLiveTranscript(newString) {
    const text = {
      type: 'paragraph',
      children: [{text: newString}],
    }
    Transforms.insertNodes(editor, text)
  }

  const [editorState, setEditorState] = React.useState(
    () => EditorState.createEmpty(),
  );
  function makeBullets(input) {
    if (RichUtils.getCurrentBlockType(input) != bulletItem) {
      setEditorState(RichUtils.toggleBlockType(input, bulletItem));
    } else {
      setEditorState(input);
     
    }
  }

  function addBullet(string) {
    
  }
  
  function MyEditor() { 
    return (
      <RichTextEditor editor={editor}/>
    )
  }
  
  function doDelete() {
    let contentState = editorState.getCurrentContent();
    var last = contentState.getLastBlock();
    var blockArray = contentState.getBlocksAsArray();
    blockArray.pop(); // rmemove last
    var newContentState = ContentState.createFromBlockArray(blockArray);
    var newEditorState = EditorState.createWithContent(newContentState)
    makeBullets(newEditorState);
  };

  // var blockArray = []

  // var newTexts = ["hello", "text", "testing"]
  // for (let i in newTexts) {
  //   var newContentBlock = new ContentBlock({
  //     type: "unorderd-list-item",
  //     text: "texttttt1",
  //   })
  //   blockArray.push(newContentBlock)
  // }

  // const blockMap = BlockMapBuilder.createFromArray(blockArray)

  // setEditorState(blockMap)

  return (
    <>
      <div id="body">
        {/* <h1>Nodebuddy</h1> */}
        <div className="actions">
          <div className="action" id="start" onClick={doStartPause}>
            {/* Start/Pause */}
            {/* <a href="https://www.flaticon.com/free-icons/play" title="play icons">Play icons created by Freepik - Flaticon</a> */}
          </div>
          <div className="action" id="end">
            {/* End */}
            {/* <a href="https://www.flaticon.com/free-icons/shape" title="shape icons">Shape icons created by Dave Gandy - Flaticon</a> */}
          </div>
          <div className="action" id="down">
            {/* Download */}
            {/* <a href="https://www.flaticon.com/free-icons/download" title="download icons">Download icons created by Debi Alpa Nugraha - Flaticon</a> */}
          </div>
        </div>

        <div id="content">
          
          <div class="cont" id="summary_wrapper">
            <h2>Summary</h2>
            <div className="scroll">
              {MyEditor()}
            </div>
            {/* {setEditorState(blockMap)} */}
            {/* Scroll to bottom */}
            <div id="delete" onClick={doDelete}></div>
          </div>
          <div class="cont" id="live_wrapper">
            <h2>Live Transcription</h2>
            <div className="scroll">
              {liveTranscript}
            </div>
            {/* live data here */}

            {/* Scroll to bottom */}
          </div>
        </div>
      </div>
    </>
  )
};

export default Home;