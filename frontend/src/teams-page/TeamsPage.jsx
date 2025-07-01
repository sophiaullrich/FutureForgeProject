import React, { useState } from "react";
import "./TeamsPage.css";
import CreateTeamModal from "./CreateTeamModal";
import InviteMembersModal from "./InviteMembersModal";
import JoinTeamModal from "./JoinTeamModal";
import TeamDetailsModal from "./TeamDetailsModal";

const TeamsPage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const mockTeams = ["Team Marketing", "Team 2", "Team 3", "Team 4"];

  return (
    <div className="teams-container">
      <div className="teams-section">
        <h2>Your Teams</h2>
        <div className="teams-grid">
          {mockTeams.map((team, idx) => (
            <button
              key={idx}
              className="team-button"
              onClick={() => setSelectedTeam(team)}
            >
              {team}
            </button>
          ))}
        </div>
      </div>
      <div className="teams-actions">
        <button onClick={() => setShowCreate(true)}>Create Team</button>
        <button onClick={() => setShowInvite(true)}>Invite Members</button>
        <button onClick={() => setShowJoin(true)}>Join a Team</button>
      </div>

      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} />}
      {showInvite && <InviteMembersModal onClose={() => setShowInvite(false)} />}
      {showJoin && <JoinTeamModal onClose={() => setShowJoin(false)} />}
      {selectedTeam && (
        <TeamDetailsModal teamName={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </div>
  );
};

export default TeamsPage;
