import { useState } from "react";
import "./Scorekeeper.css"
import SessionHeader from "../components/scorekeeper/SessionHeader";
import GameControls from "../components/scorekeeper/GameControls";
import TeamButtons from "../components/scorekeeper/TeamButtons";
import RoundHistory from "../components/scorekeeper/RoundHistory";
import type { Placement, Selection } from "../types/types";


function Scorekeeper() {
    // Select Game Mode
    const [gameMode, setGameMode] = useState<string | null>(null);

    // Round Status
    const [roundActive, setRoundActive] = useState(false);

    // Placements
    const [placements, setPlacements] = useState<Selection[][]>([]);

    // Round History
    const [roundHistory, setRoundHistory] = useState<Placement[][]>([]);

    // Tie Handling
    const [tieGroup, setTieGroup] = useState<string[]>([]);
    const [tieMode, setTieMode] = useState(false);

    // DQ Handling
    const [dqMode, setDqMode] = useState(false);

    function startRound() {
        setRoundActive(true);
        setPlacements([]);
    }

    function confirmRound() {
        // Flatten placements into Placement[]
        let results: Placement[] = [];
        let placeCounter = 1;
        placements.forEach((group) => {
            // Assign each team in this group the current placeCounter
            group.forEach(sel => {
                results.push({
                    teamId: sel.teamId,
                    place: placeCounter,
                    dq: !!sel.dq,
                });
            });

            // Increment placeCounter by 1, regardless of DQ
            placeCounter++;
        });


        setRoundHistory([...roundHistory, results]);
        setRoundActive(false);
        setPlacements([]); // reset
        setTieMode(false);
        setTieGroup([]);
        setDqMode(false);
    };

    function cancelRound(){
        setRoundActive(false);
        setPlacements([]);
        setTieMode(false);
        setTieGroup([]);
        setDqMode(false);
    }


    return (
        <div className="scorekeeper-container">
            <SessionHeader />
            <div className="scorekeeper-main">
                <div className="game-controls-box">
                    <GameControls gameMode={gameMode} setGameMode={setGameMode} 
                                  roundActive={roundActive} startRound={startRound} 
                                  confirmRound={confirmRound} cancelRound={cancelRound} 
                                  placements={placements} setPlacements={setPlacements}
                                  tieMode={tieMode} setTieMode={setTieMode}
                                  tieGroup={tieGroup} setTieGroup = {setTieGroup}
                                  dqMode={dqMode} setDqMode={setDqMode}
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
            {roundHistory.length !== 0 && <RoundHistory roundHistory={roundHistory}/>}
            </div>
        </div>
    );
}

export default Scorekeeper;