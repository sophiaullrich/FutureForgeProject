// modal for joining a team
import React from "react";

export default function JoinTeamModal({ onClose, invites = [], onJoin }) {
  // invites come from collection group query; each has a team id

  return (
    <div className="modal-backdrop">
      <div className="join-modal">
        <button className="modal-close" onClick={onClose} aria-label="close">✕</button>

        <h2 className="join-title">join a team</h2>

        {invites.length === 0 ? (
          <div className="tasks-empty" style={{ padding: 16 }}>
            you don’t have any invites yet.
          </div>
        ) : (
          <div className="team-list">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="team-card"
                style={{ justifyContent: "space-between" }}
              >
                <div className="team-card-info">
                  <div className="team-name">team id: {inv.teamId}</div>
                  <div className="pill-row">
                    <span className="pill">invite</span>
                  </div>
                </div>
                <button
                  className="join-btn"
                  onClick={() => onJoin?.({ teamId: inv.teamId })}
                >
                  join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
