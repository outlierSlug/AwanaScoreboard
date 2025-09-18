import type { Placement, SessionScore } from "../../types/types";
import { useEffect, useState } from "react";

// Helper function to get team color from ID
function getTeamColor(teamId: string): string {
  // Split the ID to get division and color (e.g., "tnt-red" -> ["tnt", "red"])
  const [_, color] = teamId.split('-');
  return color ? color.charAt(0).toUpperCase() + color.slice(1) : 'Unknown';
}

type Round = {
  id: string;
  roundNumber: number;
  results: Array<{
    teamId: string;
    place: number;
    pointsAwarded: number;
    note: string | null;
  }>;
};


type RoundHistoryProps = {
  sessionId: string;
  refreshTrigger?: number;
};

function RoundHistory({ sessionId, refreshTrigger = 0 }: RoundHistoryProps) {
  const [sessionScores, setSessionScores] = useState<SessionScore[]>([]);
  const [roundHistory, setRoundHistory] = useState<Round[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isLatestRound = (roundNumber: number) => {
    return roundNumber === Math.max(...roundHistory.map(r => r.roundNumber));
  };

  async function handleDeleteRound(roundId: string) {
        try {
            const res = await fetch(`http://localhost:4000/rounds/${roundId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error('Failed to delete round');
            }

            // Refetch data after deletion
            fetchSessionData();
        } catch (err) {
            console.error('Failed to delete round:', err);
        }
    }

  async function fetchSessionData() {
    // Add guard for undefined sessionId
    if (!sessionId) {
      setError("No session ID provided");
      return;
    }

    try {
      // Fetch scores
      const scoresRes = await fetch(
        `http://localhost:4000/sessions/${sessionId}/scores`
      );
      const roundsRes = await fetch(
        `http://localhost:4000/sessions/${sessionId}/rounds`
      );

      if (!scoresRes.ok || !roundsRes.ok) {
        throw new Error("Failed to fetch session data");
      }

      const { scores } = await scoresRes.json();
      const { rounds } = await roundsRes.json();

      setSessionScores(scores);
      setRoundHistory(rounds);
      setError(null); // Clear any previous errors
      setIsInitialLoad(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Failed to fetch session data:", err);
      setIsInitialLoad(false);
    } 
  }

  useEffect(() => {
    // Only fetch if we have a sessionId
    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId, refreshTrigger]);

  if (!sessionId) return <div>No session ID provided</div>;
  if (error) return <div>Error: {error}</div>;

  const sortedScores = [...sessionScores].sort((a, b) => b.totalPoints - a.totalPoints);

  const sortedRounds = [...roundHistory].sort((a, b) => a.roundNumber - b.roundNumber);

  return (
    <div className="round-history-container">
      {/* Current Standings */}
      <div className="standings-box">
        <h3>Current Standings</h3>
        <table>
          <thead>
            <tr>
              <th>Place</th>
              <th>Team</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {sortedScores.map((score, index) => (
              <tr key={score.teamId} className={`team-${score.team.color.toLowerCase()}`}>
                <td>{index + 1}</td>
                <td>{score.team.color}</td>
                <td>{score.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
      <div className="round-history-box">
        <h3>Round History</h3>
        {!isInitialLoad && sortedRounds.length === 0 ? (
          <p>No rounds played yet</p>
        ) : (
          sortedRounds.map((round) => (
            <div key={round.id} className="round-card">
              <div className="round-card-content">
                <strong>Round {round.roundNumber}:</strong>{" "}
                {round.results
                  .sort((a, b) => a.place - b.place)
                  .map((result, j) => {
                    const teamColor = getTeamColor(result.teamId);
                    return (
                      <span key={result.teamId}>
                        <span className={`team-text-${teamColor.toLowerCase()}`}>
                          {teamColor}
                        </span>
                        {" "}({result.place}
                        {result.note === "DQ" ? ", DQ" : ""})
                        {j < round.results.length - 1 ? ", " : ""}
                      </span>
                    );
                  })}
                {isLatestRound(round.roundNumber) && (
                  <button 
                    onClick={() => handleDeleteRound(round.id)}
                    className="delete-round-btn"
                    title="Delete latest round"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default RoundHistory;