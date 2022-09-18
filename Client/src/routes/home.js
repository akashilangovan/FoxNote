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


const Home = () => {
  const [startpauseIcon, setStartpauseIcon] = React.useState("start");
  const [restart, setRestart] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [stopRecording, setStopRecording] = useState(true)
  const [entities, setEntities] = useState({})
  const [buffer, setBuffer] = useState("")
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  let isRecording = false;
  let socket;
  let recorder;
  let seenAudioEndTimes = []
  var msgBuffer = ''

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
          let msgBuffer = buffer
          const res = JSON.parse(message.data);
          console.log(res)
          if (res.message_type == "FinalTranscript") {
            texts[res.audio_start] = res.text;
            const keys = Object.keys(texts);
            keys.sort((a, b) => a - b);
            for (const key of keys) {
              console.log("KEY", texts[key])
              if (key in seenAudioEndTimes) {
              } else {
                seenAudioEndTimes.push(key)
                if (texts[key]) {
                  msgBuffer = msgBuffer + " " + texts[key]
                  setTranscript(transcript + " " + texts[key])
                }
              }
            }
            setBuffer(msgBuffer)
            msgBuffer = msgBuffer.split(".")
            //while (msgBuffer.length > 5 && msgBuffer.join(".").length > 200) {
              message = ""
              while ((message.split(".").length < 5 || message.length < 200) && msgBuffer.length) {
                message += msgBuffer.pop(0) + "."
                console.log("BUFSDF", msgBuffer)
              }
              setBuffer(msgBuffer.join("."))
              fetch("http://localhost:8000/summarize/?transcript=" + encodeURIComponent(message), {
                method: "GET"
              }).then(res => {
                return res.json()
              }).then(data => {
                if (data.text != "") {
                  setEntities(Object.assign({}, entities, data.entities))
                  updateLiveTranscript(data.text.trim())
                  for (let e in Object.keys(entities)) {
                    console.log("SDLKJ", entities[e])
                  }
                }
              });
              console.log(buffer.length)
              console.log(buffer, "BUFFFFERRRR")
            //}
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
                timeSlice: 1500, // set 250 ms intervals of data that sends to AAI
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

  function MyEditor() { 
    return (
      <RichTextEditor editor={editor}/>
    )
  }

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
          <div className="action" id="start" onClick={doStartPause}></div>
          <div className="action" id="cc"></div>
          {/* <div className="action" id="end"></div> */}
          <div className="action" id="down"></div>
        </div>

        <div id="content">
          
          <div className="cont" id="summary_wrapper">
            {/* <h2>Summary</h2> */}
            <div>
              {MyEditor()}
            </div>
            {/* {setEditorState(blockMap)} */}
            {/* Scroll to bottom */}
            {/* <div id="delete" onClick={doDelete}></div> */}

            
          </div>
        </div>
        <div className='subtitle'>
              <span>
                {transcript}
              </span>
            </div>
      </div>
    </>
  )
};

export default Home;