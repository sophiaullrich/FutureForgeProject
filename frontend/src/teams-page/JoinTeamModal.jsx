// src/teams-page/JoinTeamModal.jsx
import React, { useState } from "react";

export default function JoinTeamModal({ onClose }) {
  const [search, setSearch] = useState("");

  const dummyTeams = [
    {
      name: "Code Commanders",
      focus: "Technology",
      type: "Remote",
      size: "4 Members",
    },
    {
      name: "Job Seeker Tips",
      focus: "HR",
      type: "Hybrid",
      size: "20 Members",
    },
    {
      name: "Cyber Unlocked",
      focus: "Technology",
      type: "Remote",
      size: "3 Members",
    },
    {
      name: "Team 2048",
      focus: "Technology",
      type: "Remote",
      size: "12 Members",
    },
  ];

  const filtered = dummyTeams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Join a Team</h2>

        <input
          type="text"
          placeholder="Search by career goal, skill, or team name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ marginTop: "1rem" }}>
          {filtered.map((team, index) => (
            <div
              key={index}
              style={{
                border: "2px solid #1a1a3c",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong>{team.name}</strong>
                <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                  <span style={{ marginRight: "1rem" }}>{team.focus}</span>
                  <span style={{ marginRight: "1rem" }}>{team.type}</span>
                  <span>{team.size}</span>
                </div>
              </div>
              <button style={{ background: "#1a1a3c", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px" }}>
                Join →
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
