import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";


import HomePage from "./pages/HomePage";
import Scoreboard from "./pages/Scoreboard";
import Scorekeeper from "./pages/Scorekeeper";

import "./App.css";

function App() {
    return (
      <Router>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/scoreboard">Scoreboard</Link>
          <Link to="/scorekeeper">Scorekeeper</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/scorekeeper/:sessionId" element={<Scorekeeper />} />
          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
      </Router>
    );
}


export default App;