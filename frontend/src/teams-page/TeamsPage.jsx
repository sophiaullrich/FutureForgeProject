import React, { useEffect, useState } from "react";
import TeamCard from "./TeamCard";
import CreateTeamModal from "./CreateTeamModal";
import InviteMembersModal from "./InviteMembersModal";
import JoinTeamModal from "./JoinTeamModal";
import TeamDetailsModal from "./TeamDetailsModal";
import "./TeamsPage.css";

import {
  observeMyTeams,
  observeMyInvites,
  createTeam,
  inviteMember,
  acceptInvite,
  deleteTeam,
  addMembers,
} from "./TeamsService";
import { auth } from "../Firebase";

export default function TeamsPage() {
  const [modal, setModal] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [invites, setInvites] = useState([]);
  const [authed, setAuthed] = useState(!!auth.currentUser);

  useEffect(() => {
    if (auth.currentUser) {
      setAuthed(true);
      return;
    }
    const off = auth.onAuthStateChanged((u) => setAuthed(!!u));
    return () => off && off();
  }, []);

  useEffect(() => {
    if (!authed) return;
    const offTeams = observeMyTeams(setTeams);
    const offInvites = observeMyInvites(setInvites);
    return () => {
      offTeams && offTeams();
      offInvites && offInvites();
    };
  }, [authed]);

  const handleCardClick = (team) => {
    setSelectedTeam(team);
    setModal("details");
  };

  const handleAddTeam = async ({ name, description }) => {
    const teamId = await createTeam({ name, description });
    return teamId;
  };

  const handleAddMembers = async ({ teamId, memberUids }) => {
    await addMembers({ teamId, memberUids });
    setModal(null);
  };

  const handleInvite = async ({ teamId, email }) => {
    await inviteMember({ teamId, inviteeEmail: email });
    setModal(null);
  };

  const handleJoinTeam = async ({ teamId }) => {
    await acceptInvite({ teamId });
    setModal(null);
  };

  const handleDeleteTeam = async (teamId) => {
    await deleteTeam({ teamId });
    setModal(null);
  };

  return (
    <div className="teams-page">
      <section className="your-teams-panel">
        <div className="panel-title">Your Teams</div>
        <div className="teams-grid">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onClick={() => handleCardClick(team)} />
          ))}
        </div>
      </section>

      <div className="teams-actions">
        <button onClick={() => setModal("create")} className="action-tile">
          <span>Create Team</span>
          <span className="chevron">›</span>
        </button>
        <button onClick={() => setModal("invite")} className="action-tile">
          <span>Invite Members</span>
          <span className="chevron">›</span>
        </button>
        <button onClick={() => setModal("join")} className="action-tile">
          <span>Join a Team</span>
          <span className="chevron">›</span>
        </button>
      </div>

      {modal === "create" && (
        <CreateTeamModal
          onClose={() => setModal(null)}
          onCreate={handleAddTeam}
          onAddMembers={handleAddMembers}
        />
      )}

      {modal === "invite" && (
        <InviteMembersModal
          onClose={() => setModal(null)}
          teams={teams}
          onInvite={handleInvite}
        />
      )}

      {modal === "join" && (
        <JoinTeamModal
          onClose={() => setModal(null)}
          invites={invites}
          onJoin={handleJoinTeam}
        />
      )}

      {modal === "details" && selectedTeam && (
        <div className="modal-backdrop">
          <TeamDetailsModal
            team={selectedTeam}
            onClose={() => setModal(null)}
            onDelete={() => handleDeleteTeam(selectedTeam.id)}
          />
        </div>
      )}
    </div>
  );
}
