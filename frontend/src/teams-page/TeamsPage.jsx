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
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create team");
      const createdTeam = await res.json();
      setTeams((prev) => [...prev, createdTeam]);
      setModal(null);
    } catch (err) {
      console.error("Error creating team:", err.message);
      alert("Could not create team: " + err.message);
    }
  };

  const handleJoinTeam = (joinedTeam) => {
    if (!teams.some((t) => t.name === joinedTeam.name)) {
      setTeams((prev) => [...prev, joinedTeam]);
    }
  };

  return (
    <div className="teams-page">
      {/* Your Teams panel */}
      <section className="your-teams-panel">
        <div className="panel-title">Your Teams</div>
        <div className="teams-grid">
          {teams.map((team, i) => (
            <TeamCard key={i} team={team} onClick={() => handleCardClick(team)} />
          ))}
        </div>
      </section>

      {/* Action rows */}
      <div className="teams-actions">
        <button onClick={() => setModal("create")} className="action-tile">
          <span>Create Team</span><span className="chevron">›</span>
        </button>
        <button onClick={() => setModal("invite")} className="action-tile">
          <span>Invite Members</span><span className="chevron">›</span>
        </button>
        <button onClick={() => setModal("join")} className="action-tile">
          <span>Join a Team</span><span className="chevron">›</span>
        </button>
      </div>

      {/* Modals */}
      {modal === "create" && (
        <CreateTeamModal onClose={() => setModal(null)} onCreate={handleAddTeam} />
      )}
      {modal === "invite" && <InviteMembersModal onClose={() => setModal(null)} />}
      {modal === "join" && (
        <JoinTeamModal onClose={() => setModal(null)} onJoinTeam={handleJoinTeam} />
      )}
      {modal === "details" && selectedTeam && (
        <div className="modal-backdrop">
          <TeamDetailsModal team={selectedTeam} onClose={() => setModal(null)} />
        </div>
      )}
    </div>
  );
}
