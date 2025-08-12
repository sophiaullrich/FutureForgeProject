// src/teams-page/TeamsPage.jsx
import React, { useState, useEffect } from "react";
import TeamCard from "./TeamCard";
import CreateTeamModal from "./CreateTeamModal";
import InviteMembersModal from "./InviteMembersModal";
import JoinTeamModal from "./JoinTeamModal";
import TeamDetailsModal from "./TeamDetailsModal";
import "./TeamsPage.css";


export default function TeamsPage() {
  const [modal, setModal] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("Failed to fetch teams:", err));
  }, []);

  const handleCardClick = (team) => {
    setSelectedTeam(team);
    setModal("details");
  };

  const handleAddTeam = async (newTeam) => {
    try {
      const res = await fetch("http://localhost:5000/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeam),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create team");
      }

      const createdTeam = await res.json();
      setTeams((prev) => [...prev, createdTeam]);
      setModal(null);
    } catch (err) {
      console.error("Error creating team:", err.message);
      alert("Could not create team: " + err.message);
    }
  };

  const handleJoinTeam = (joinedTeam) => {
    // Prevent duplicate joins
    const alreadyJoined = teams.some((team) => team.name === joinedTeam.name);
    if (!alreadyJoined) {
      setTeams((prev) => [...prev, joinedTeam]);
    }
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
          <TeamCard key={i} team={team} onClick={() => handleCardClick(team)} />
        ))}
      </div>

      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button onClick={() => setModal("create")} className="styled-btn">Create Team</button>
        <button onClick={() => setModal("invite")} className="styled-btn">Invite Members</button>
        <button onClick={() => setModal("join")} className="styled-btn">Join a Team</button>
      </div>

      {modal === "create" && (
        <CreateTeamModal onClose={() => setModal(null)} onCreate={handleAddTeam} />
      )}
      {modal === "invite" && <InviteMembersModal onClose={() => setModal(null)} />}
      {modal === "join" && (
        <JoinTeamModal
          onClose={() => setModal(null)}
          onJoinTeam={handleJoinTeam}
        />
      )}
      {modal === "details" && selectedTeam && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <TeamDetailsModal team={selectedTeam} onClose={() => setModal(null)} />
        </div>
      )}
    </div>
  );
}
