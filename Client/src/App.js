// App.js
import * as React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import About from "./routes/about";
import Home from "./routes/home";
import "./App.css"

// start/pause/stop recording
// live summarization & live transcription
// quick accept/reject specific word transcription
// download as txt file

function App() {
  return (
    <div>
      <div id="topNav">
        <div className="left" id="logo"></div>
        <Link to="/home"><div className="left">Nodebuddy</div></Link>
        <Link to="/about"><div className="right">about</div></Link>
      </div>


      <Routes>
        <Route path="/home" element= {<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>


      <div id="footer">
        <p>peson 1</p>
        <p>peson 2</p>
        <p>peson 3</p>
        <p>peson 4</p>
        <p>peson 5</p>
        

      </div>





      

      

        
    </div>
  );
}

export default App;
