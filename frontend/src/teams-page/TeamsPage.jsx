// src/teams-page/TeamsPage.jsx
import React, { useState, useEffect } from "react";
import TeamCard from "./TeamCard";
import CreateTeamModal from "./CreateTeamModal";
import InviteMembersModal from "./InviteMembersModal";
import JoinTeamModal from "./JoinTeamModal";
import TeamDetailsModal from "./TeamDetailsModal"; 

export default function TeamsPage() {
  const [modal, setModal] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const teams = ["Team Marketing", "Team 2", "Team 3", "Team 4"];

  const handleCardClick = (teamName) => {
    setSelectedTeam(teamName);
    setModal("details");
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#fdf6ee", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "1rem" }}>Your Teams</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          background: "#1e1e1e",
          padding: "1rem",
          borderRadius: "10px",
        }}
      >
        {teams.map((team, i) => (
          <TeamCard key={i} name={team} onClick={() => handleCardClick(team)} />
        ))}
      </div>

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <button onClick={() => setModal("create")} className="styled-btn">
          Create Team
        </button>
        <button onClick={() => setModal("invite")} className="styled-btn">
          Invite Members
        </button>
        <button onClick={() => setModal("join")} className="styled-btn">
          Join a Team
        </button>
      </div>

      {modal === "create" && <CreateTeamModal onClose={() => setModal(null)} />}
      {modal === "invite" && <InviteMembersModal onClose={() => setModal(null)} />}
      {modal === "join" && <JoinTeamModal onClose={() => setModal(null)} />}
      {modal === "details" && (
        <TeamDetailsModal onClose={() => setModal(null)} teamName={selectedTeam} />
      )}
    </div>
  );
}
