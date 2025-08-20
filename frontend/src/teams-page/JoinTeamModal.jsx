// src/teams-page/JoinTeamModal.jsx
import React from "react";

export default function JoinTeamModal({ onClose, invites = [], onJoin }) {
  // invites are documents from collection group query; each has a teamId
  return (
    <div className="modal-backdrop">
      <div className="join-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="join-title">Join a Team</h2>

        {invites.length === 0 ? (
          <div className="tasks-empty" style={{ padding: 16 }}>
            You don’t have any invites yet.
          </div>
        ) : (
          <div className="team-list">
            {invites.map((inv) => (
              <div key={inv.id} className="team-card" style={{ justifyContent: "space-between" }}>
                <div className="team-card-info">
                  <div className="team-name">Team ID: {inv.teamId}</div>
                  <div className="pill-row">
                    <span className="pill">Invite</span>
                  </div>
                </div>
                <button className="join-btn" onClick={() => onJoin?.({ teamId: inv.teamId })}>
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
