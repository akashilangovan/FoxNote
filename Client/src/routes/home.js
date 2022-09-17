import React, { useState } from 'react';
import { Outlet, Link,  } from "react-router-dom";
import "../App.css"
import {Editor, EditorState} from 'draft-js';
import 'draft-js/dist/Draft.css';

function MyEditor() {
  const [editorState, setEditorState] = React.useState(
    () => EditorState.createEmpty(),
  );

  return <Editor editorState={editorState} onChange={setEditorState} className="editor" />;
}

const Home = () => {
  return (
    <>
      <div id="body">
        <h1>Home</h1>




        <div className="actions">
          <div className="action" id="startpause">
            Start/Pause
            {/* <a href="https://www.flaticon.com/free-icons/play" title="play icons">Play icons created by Freepik - Flaticon</a> */}
          </div>
          <div className="action" id="end">
            End
            {/* <a href="https://www.flaticon.com/free-icons/shape" title="shape icons">Shape icons created by Dave Gandy - Flaticon</a> */}
          </div>
          <div className="action" id="down">
            Download
            {/* <a href="https://www.flaticon.com/free-icons/download" title="download icons">Download icons created by Debi Alpa Nugraha - Flaticon</a> */}
          </div>
        </div>

        <p>top</p>
        {MyEditor()}
        <p>btm</p>
        {/* <Editor editorState={this.state.editorState} onChange={this.onChange} /> */}





      </div>
      
    </>
  )
};

export default Home;