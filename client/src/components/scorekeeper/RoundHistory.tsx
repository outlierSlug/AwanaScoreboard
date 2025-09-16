import type {Placement} from "../../types/types";

type RoundHistoryProps = {
  roundHistory: Placement[][];
};

function RoundHistory({ roundHistory }: RoundHistoryProps) {
  return (
    <div className="round-history-box">
      {roundHistory.length === 0 ? null : (
        roundHistory.map((round, i) => (
          <div key={i} className="round-card">
            <strong>Round {i + 1}:</strong>{" "}
            {round.map((p, j) => (
              <span key={p.teamId} className="team-label">
                {p.teamId} ({p.place}{p.dq ? ", DQ" : ""})
                {j < round.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
export default RoundHistory;