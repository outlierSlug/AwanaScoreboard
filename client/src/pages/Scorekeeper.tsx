import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Scorekeeper.css"
import SessionHeader from "../components/scorekeeper/SessionHeader";
import GameControls from "../components/scorekeeper/GameControls";
import TeamButtons from "../components/scorekeeper/TeamButtons";
import RoundHistory from "../components/scorekeeper/RoundHistory";
import type { Placement, Selection, SessionScore, Round } from "../types/types";

type SessionDetails = {
    id: string;
    date: Date;
    division: {
        id: string;
        name: string;
        teams: {
            id: string;
            color: string;
        }[];
    };
    status: 'running' | 'finished';
};


function Scorekeeper() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

     // Add session state
    const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);


    // Select Game Mode
    const [gameMode, setGameMode] = useState<string | null>(null);

    // Round Status
    const [roundActive, setRoundActive] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);


    // Placements
    const [placements, setPlacements] = useState<Selection[][]>([]);

    // Tie Handling
    const [tieGroup, setTieGroup] = useState<string[]>([]);
    const [tieMode, setTieMode] = useState(false);

    // DQ Handling
    const [dqMode, setDqMode] = useState(false);

    // Session Scores
    const [sessionScores, setSessionScores] = useState<SessionScore[]>([]);

    const [refreshCounter, setRefreshCounter] = useState(0);

    // Fetch session details on mount
    useEffect(() => {
        async function fetchSessionDetails() {
            if (!sessionId) {
                navigate('/');
                return;
            }

            try {
                const res = await fetch(`http://localhost:4000/sessions/${sessionId}`);
                if (!res.ok) throw new Error('Failed to fetch session');
                
                const data = await res.json();
                setSessionDetails(data);
            } catch (err) {
                console.error('Failed to load session:', err);
                navigate('/');
            }
        }

        fetchSessionDetails();
    }, [sessionId, navigate]);

    function startRound() {
        setRoundActive(true);
        setPlacements([]);
    }

    async function confirmRound() {
        if (!sessionDetails) return;
        setIsConfirming(true);
        try {
            const roundsRes = await fetch(`http://localhost:4000/sessions/${sessionId}/rounds`);
            
            if (!roundsRes.ok) {
                throw new Error("Failed to fetch rounds");
            }
            
            const { rounds } = await roundsRes.json();
            const nextRoundNumber = rounds.length > 0 
                ? Math.max(...rounds.map((r: Round) => r.roundNumber)) + 1 
                : 1;

            // Create team ID map from session details
            const teamIdMap: Record<string, string> = {};
            sessionDetails.division.teams.forEach(team => {
                teamIdMap[team.color.toLowerCase()] = team.id;
            });

            // Flatten placements into [{ teamId, place, dq }]
            let results: { teamId: string; place: number; dq: boolean }[] = [];
            let placeCounter = 1;

            placements.forEach((group) => {
                group.forEach((sel) => {
                    results.push({
                        teamId: teamIdMap[sel.teamId] || sel.teamId, // map to DB ID
                        place: placeCounter,
                        dq: !!sel.dq,
                    });
                });
                placeCounter++;
            });
            
            const res = await fetch("http://localhost:4000/rounds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    gameId: gameMode,
                    roundNumber: nextRoundNumber,
                    placements: results,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    `Failed to confirm round: ${res.statusText}\n${errorData.details || ''}`
                );
            }

            const { round, scores } = await res.json();
            console.log("Round saved:", round);
            console.log("Updates scores:", scores);

            setSessionScores(scores);
            setRefreshCounter(prev => prev + 1); // Trigger RoundHistory refresh

            setRoundActive(false);
            setPlacements([]);
            setTieMode(false);
            setTieGroup([]);
            setDqMode(false);
        } catch (err) {
            console.error("❌ Failed to save round:", err);
        } finally {
            setIsConfirming(false);
        }
    }

    function cancelRound(){
        setRoundActive(false);
        setPlacements([]);
        setTieMode(false);
        setTieGroup([]);
        setDqMode(false);
    }

    // Early return if session not loaded
    if (!sessionDetails) {
        return (
            <div>
                {/** Blank Page */}
            </div>
        );
    }

    return (
        <div className="scorekeeper-container">
            <SessionHeader sessionId={sessionDetails.id} date={sessionDetails.date} division={sessionDetails.division.name} status={sessionDetails.status}/>
            <div className="scorekeeper-main">
                <div className="game-controls-box">
                    <GameControls gameMode={gameMode} setGameMode={setGameMode} 
                                  roundActive={roundActive} startRound={startRound} 
                                  confirmRound={confirmRound} cancelRound={cancelRound} 
                                  placements={placements} setPlacements={setPlacements}
                                  tieMode={tieMode} setTieMode={setTieMode}
                                  tieGroup={tieGroup} setTieGroup = {setTieGroup}
                                  dqMode={dqMode} setDqMode={setDqMode} isConfirming={isConfirming}
                                  />
                </div>

                <div className="team-buttons-box">
                    <h2>Team Placements</h2>
                    <TeamButtons gameMode={gameMode} roundActive={roundActive} 
                                 placements={placements} setPlacements={setPlacements}
                                 tieMode={tieMode} setTieMode={setTieMode}
                                 tieGroup={tieGroup} setTieGroup={setTieGroup}
                                 dqMode={dqMode} setDqMode={setDqMode}
                                />
                </div> 
            </div>
            <div>
            { <RoundHistory sessionId={sessionDetails.id} refreshTrigger={refreshCounter}/>}
            </div>
        </div>
    );
}

export default Scorekeeper;