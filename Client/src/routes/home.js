import React, { useState } from 'react';
import { Outlet, Link,  } from "react-router-dom";
import "../App.css"
import {Editor, EditorState, BlockMapBuilder, ContentBlock, RichUtils, SelectionState, Modifier, ContentState} from 'draft-js';
import 'draft-js/dist/Draft.css';
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
  function doPlayPause() {
    if (startpauseIcon == "start") {
      document.getElementById("start").id="pause";
      setStartpauseIcon("pause");
    } else {
      document.getElementById("pause").id="start";
      setStartpauseIcon("start");
    }
  }


  const [liveTranscript, setLiveTranscript] = React.useState("He today. We're starting a new chapter, chapter four, about the time value of money, which is something that we tal");
  function updateLiveTranscript(newString) {
    setLiveTranscript(liveTranscript + newString);
  }



  const [editorState, setEditorState] = React.useState(
    () => EditorState.createEmpty(),
  );
  function makeBullets(input) {
    if (RichUtils.getCurrentBlockType(input) != bulletItem) {
      setEditorState(RichUtils.toggleBlockType(input, bulletItem));
    } else {
      setEditorState(input);
      var objDiv = document.getElementById("summary_wrapper");
      objDiv.scrollTop = objDiv.scrollHeight;


    }
  }
  function MyEditor() { 
    return <Editor editorState={editorState} onChange={makeBullets} />;
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
        <h1>Nodebuddy</h1>
        <div className="actions">
          <div className="action" id="start" onClick={doPlayPause}>
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
          
          <div id="summary_wrapper">
            <h2>Summary</h2>
            <div className="scroll">
              {MyEditor()}
            </div>
            {/* {setEditorState(blockMap)} */}
            Scroll to bottom
            <div id="delete" onClick={doDelete}></div>
          </div>
          <div id="live_wrapper">
            <h2>Live Transcription</h2>
            <div className="scroll">
              {liveTranscript}
            </div>
            live data here

            Scroll to bottom
          </div>
        </div>





      </div>
    </>
  )
};

export default Home;