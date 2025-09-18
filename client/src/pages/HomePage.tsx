import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

type SessionListItem = {
  id: string;
  date: string;
  status: string;
  division: {
    name: string;
  };
};


const CHURCH_ID = "ECC-RED-DEV"; 
const DIVISION_IDS = {
  "Sparks": "sparks",
  "T&T": "tnt"
}

function HomePage() {
  const navigate = useNavigate();

  const formatDateForInput = (date: Date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };

  // State for creating a session
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [division, setDivision] = useState<"Sparks" | "T&T">("Sparks");

  // State for viewing a scoreboard
  const [sessionId, setSessionId] = useState("");

  const [isCreating, setIsCreating] = useState(false);

  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [visibleSessions, setVisibleSessions] = useState(5);

  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleLoadMore = () => {
    setVisibleSessions(prev => prev + 5);
  };

  // Fetch existing sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch(`http://localhost:4000/sessions`);
        if (!res.ok) throw new Error('Failed to fetch sessions');
        const data = await res.json();
        setSessions(data.sessions);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      }
    }

    fetchSessions();
  }, []);

  const handleCreateSession = async () => {
    try {
      setIsCreating(true);
      
      const res = await fetch("http://localhost:4000/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          divisionId: DIVISION_IDS[division],
          date: new Date().toISOString(), // Use UTC time for session creation
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session");
      }

      const data = await res.json();
      console.log('Session created:', data); // Add logging
      navigate(`/scorekeeper/${data.id}`); // Change sessionId to id to match server response
    } catch (err) {
      console.error("Failed to create session:", err);
      // TODO: Add error UI
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewScoreboard = () => {
    if (sessionId) {
      navigate(`/scoreboard/${sessionId}`);
    }
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
          <button onClick={handleCreateSession} disabled={!date || isCreating }>
            {isCreating? "Creating..." : "Create Session"}
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
      
      {/* Session History Card (below) */}
      <div className="session-history-card">
        <h2>Session History</h2>
        <div className="sessions-list">
          {sortedSessions.slice(0, visibleSessions).map(session => (
            <div key={session.id} className="session-item">
              <div className="session-info">
                <span className="session-id">{session.id}</span>
                <span className="session-date">
                  {new Date(session.date).toLocaleDateString()}
                </span>
                <span className="session-division">{session.division.name}</span>
                <span className={`session-status status-${session.status}`}>
                  {session.status}
                </span>
              </div>
              <button 
                onClick={() => navigate(`/scorekeeper/${session.id}`)}
              >
                {session.status === 'running' ? 'Continue' : 'View'}
              </button>
            </div>
          ))}
        </div>
        {sessions.length > visibleSessions && (
          <button className="load-more" onClick={handleLoadMore}>
            Load More
          </button>
        )}
      </div>
    </div>
  );
}

export default HomePage;