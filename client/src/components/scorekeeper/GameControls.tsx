import React from "react";
import { useState, useEffect } from "react";
import type { Selection } from "../../types/types";


type GameControlsProps = {
  gameMode: string | null;
  setGameMode: (mode: string) => void;
  roundActive: boolean;
  startRound: () => void;
  confirmRound: () => void;
  cancelRound: () => void;
  placements: Selection[][];
  setPlacements: React.Dispatch<React.SetStateAction<Selection[][]>>;
  tieMode: boolean;
  setTieMode: (v: boolean) => void;
  tieGroup: string[];
  setTieGroup: (v: string[]) => void;
  dqMode: boolean;
  setDqMode: React.Dispatch<React.SetStateAction<boolean>>;
  isConfirming: boolean;
};

type Game = {
  id: string;
  name: string;
  notes?: string;
};

function GameControls({ gameMode, setGameMode, roundActive, startRound, confirmRound, cancelRound, placements, setPlacements, tieMode, setTieMode, tieGroup, setTieGroup,
    dqMode, setDqMode, isConfirming
 }: GameControlsProps) {

    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Get games for the session
    useEffect(() => {
        const fetchGames = async () => {
        try {
            const res = await fetch('http://localhost:4000/games');
            if (!res.ok) throw new Error('Failed to fetch games');
            
            const data = await res.json();
            setGames(data.games);
        } catch (err) {
            console.error('Failed to load games:', err);
        } finally {
            setIsLoading(false);
        }
        };

        fetchGames();
    }, []); // Only fetch once on mount

    const toggleDQ = (teamId: string) => {
    setPlacements(prev =>
        prev.map(group =>
            group.map(sel =>
                sel.teamId === teamId ? { ...sel, dq: !sel.dq } : sel
            )
        )
    );
    };

    return (
    <div>
        <h2>Game Controls</h2>

        {/* Game Mode Selector */}
        <label>
            Select Game:
        </label>
        <div className="game-mode-row">
            <select
                value={gameMode || ""}
                onChange={(e) => setGameMode(e.target.value)}
                disabled={isLoading || roundActive}
            >
                <option value="" disabled hidden>
                    {isLoading ? "Loading..." : "-- Select Game --"}
                </option>
                {games.map(game => (
                    <option key={game.id} value={game.id} title={game.notes}>
                    {game.name}
                    </option>
                ))}
            </select>

            {/* Round controls */}
            {!roundActive && gameMode && (
                <button onClick={startRound}>Start Round</button>
            )}
            {roundActive && <button onClick={cancelRound}>Cancel Round</button>}
        </div>

        {/* Round status */}
        {roundActive && (
            <div className="round-status">
            <strong>Round in progress</strong>
            </div>
        )}

        {/* Tie Mode */}
        {roundActive && (
            <div className="tie-mode-toggle">
            <label className="switch">
                <input
                type="checkbox"
                checked={tieMode}
                onChange={(e) => {
                    const checked = e.target.checked;
                    setTieMode(checked);

                    if (!checked) {
                        // Only clear selections when exiting tie mode
                        setTieGroup([]);
                    }
                }}
                disabled={placements.flat().length >= 4 || ((4 - placements.flat().length) < 2) || dqMode}
                />
                
                <span className="slider round"></span>
            </label>
            Handle Tie
            </div>
        )}

        {/* DQ Mode */}
        {roundActive && placements.flat().length === 4 && (
        <div className="dq-mode-toggle">
            <label className="switch">
            <input
                type="checkbox"
                checked={dqMode}
                onChange={(e) => {
                    const checked = e.target.checked;
                    setDqMode(checked);
                }}
                disabled={(placements.flat().length < 1) || tieMode } // no DQ if everyone placed already
            />
            <span className="slider round"></span>
            </label>
            Handle DQ
        </div>
        )}

        {/* Current Order */}
        {roundActive && placements.length > 0 && (
        <div className="current-order">
            <h3>Current Order:</h3>
            <ol>
            {placements.map((group, i) => {
                return (
                <li key={i}>
                    {group.map((sel, idx) => {
                        const displayName = sel.dq ? `${sel.teamId} (DQ)` : sel.teamId;

                        return (
                            <React.Fragment key={sel.teamId}>
                            <span
                                className={dqMode ? "dq-clickable" : ""}
                                onClick={() => dqMode && toggleDQ(sel.teamId)}
                                style={{ cursor: dqMode ? "pointer" : "default" }}
                            >
                                {displayName}
                            </span>
                            {idx < group.length - 1 && <span>, </span>}
                            </React.Fragment>
                        );
                    })}
                </li>
                );
            })}
            </ol>
        </div>
        )}

        
        
        {roundActive && placements.flat().length === 4 && (
            <div className="confirm-round-btn">
            <button onClick={confirmRound} disabled={isConfirming}>
                {isConfirming ? "Confirming..." : "Confirm Round"}
            </button>
            </div>
        )}
        
    </div>
  );
}

export default GameControls;