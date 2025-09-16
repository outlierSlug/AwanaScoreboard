import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  // State for creating a session
  const [date, setDate] = useState("");
  const [division, setDivision] = useState<"Sparks" | "T&T">("Sparks");

  // State for viewing a scoreboard
  const [sessionId, setSessionId] = useState("");

  const handleCreateSession = () => {
    // Here you would call your server to create a session and get a sessionId
    const newSessionId = "ABC123"; // placeholder
    navigate("/scorekeeper", {
      state: { sessionId: newSessionId, date, division },
    });
  };

  const handleViewScoreboard = () => {
    navigate("/scoreboard", { state: { sessionId } });
  };

  return (
    <div className="home-container">
      <h1>Awana Scoreboard Home</h1>
      <div className="home-cards">
        {/* Create Session Card */}
        <div className="home-card">
          <h2>Create New Session</h2>
          <label>
            Date: <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Division:
            <select value={division} onChange={(e) => setDivision(e.target.value as "Sparks" | "T&T")}>
              <option value="Sparks">Sparks</option>
              <option value="T&T">T&T</option>
            </select>
          </label>
          <button onClick={handleCreateSession} disabled={!date}>
            Create Session
          </button>
        </div>

        {/* View Scoreboard Card */}
        <div className="home-card">
          <h2>View Scoreboard</h2>
          <label>
            Session ID: <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
          </label>
          <button onClick={handleViewScoreboard} disabled={!sessionId}>
            View Scoreboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;