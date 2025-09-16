import React, { useState } from "react";
import "./Scoreboard.css";

type TeamScore = {
    id: string;
    name: string;
    points: number;
}

function Scoreboard() {
    // MOCK DATA
    const [scores] = useState<TeamScore[]>([
        { id: "red", name: "Red", points: 100 },
        { id: "blue", name: "Blue", points: 80 },
        { id: "green", name: "Green", points: 60 },
        { id: "yellow", name: "Yellow", points: 40 },
    ]);

    const sortedScores = [...scores].sort((a, b) => b.points - a.points);

    function renderTable() {
        return (
        <tbody>
            {sortedScores.map((team, index) => {
            const teamClass = `team-${team.id}`;
            return (
                <tr key={team.id} className={teamClass}>
                <td>{index + 1}</td>
                <td>{team.name}</td>
                <td>{team.points}</td>
                </tr>
            );
            })}
        </tbody>
        );
    }
    return (
        <div className="scoreboard-container">
            <h1>Scoreboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Team</th>
                        <th>Points</th>
                    </tr>
                </thead>
                {renderTable()}
            </table>
        </div>

    );

}

export default Scoreboard;