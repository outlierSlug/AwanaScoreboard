import type { Selection } from "../../types/types"

type TeamButtonsProps = {
  gameMode: string | null;
  roundActive: boolean;
  placements: Selection[][];
  setPlacements: (p: Selection[][]) => void;
  tieMode: boolean;
  setTieMode: (p: boolean) => void;
  tieGroup: string[];
  setTieGroup: (p: string[]) => void;
  dqMode: boolean;
  setDqMode: React.Dispatch<React.SetStateAction<boolean>>;
};


function TeamButtons({ gameMode, roundActive, placements, setPlacements, tieMode, setTieMode, tieGroup, setTieGroup, dqMode, setDqMode }: TeamButtonsProps) {
  const teams = ["red", "blue", "green", "yellow"];

  const isAlreadyPlaced = (teamId: string) =>
    placements.some((g) => g.some((m) => m.teamId === teamId));

  const handleClick = (teamId: string) => {
    if (!roundActive) return;

    if (isAlreadyPlaced(teamId)) return

    if (dqMode) return;

    if (tieMode) {
        if (tieGroup.includes(teamId)) {
            setTieGroup(tieGroup.filter((t) => t !== teamId));
        } else {
            setTieGroup([...tieGroup, teamId]);
        }
        return;
    }
    // Normal placement: commit immediately (dq:false)
    setPlacements([...placements, [{ teamId, dq: false }]]);

  };

  const confirmTieGroup = () => {
    if (tieGroup.length >= 2) {
      const group = tieGroup.map((id) => ({ teamId: id, dq: false }));
      setPlacements([...placements, group]);
      setTieGroup([]);
      setTieMode(false);
    }
  };

  const getTeamPlace = (teamId: string): number | "DQ" | null => {
    for (let i = 0; i < placements.length; i++) {
      const group = placements[i];

      const team = group.find((sel) => sel.teamId === teamId);
      if (team) return team.dq ? "DQ" : i + 1;
    }
    return null;
  };

  const undoLast = () => {
    if (placements.length === 0) return;

    const newPlacements = [...placements];
    newPlacements.pop();

    setPlacements(newPlacements);
  };

  return (
    <div className="team-buttons-grid">
      {teams.map((team) => {
        const place = getTeamPlace(team);
        const isPlaced = place !== null;
        const inTieGroup = tieGroup.includes(team);

        return (
          <button
            key={team}
            className={`team-btn ${team} ${isPlaced ? "placed" : ""}`}
            onClick={() => handleClick(team)}
            disabled={!gameMode || !roundActive || isPlaced}
          >
            {team}
            {isPlaced && (
              <span className="placement-badge">{place === "DQ" ? "DQ" : place}</span>
            )}
            {inTieGroup && !isPlaced && (
              <span className="placement-badge">{placements.length + 1}</span>
            )}
 
          </button>
        );
      })}
      
    {placements.flat().length > 0 && (
      <div className="button-controls-bar">
        <button className="control-button undo" onClick={undoLast} disabled={tieMode || dqMode}>
          Undo Last
        </button>
        <button
          className="control-button reset"
          onClick={() => setPlacements([])}
          disabled={tieMode || dqMode}
        >
          Reset
        </button>
        
      </div>
    )}

    {tieMode && tieGroup.length >= 2 && (
        <button className="control-button confirm-tie" onClick={confirmTieGroup} disabled={placements.length >=4}>
        Confirm Tie
        </button>
    )}

    </div>
  );
}
export default TeamButtons;