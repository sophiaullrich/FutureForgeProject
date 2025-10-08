// src/teams-page/TeamsPage.jsx
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
  joinPublicTeam, 
  deleteTeam,
  addMembers,
} from "./TeamsService"; 

import { auth } from "../Firebase";

const CHAT_BACKEND_URL = "http://localhost:5001/api/chat";

export default function TeamsPage() {
  // ui state
  const [modal, setModal] = useState(null); // "create" | "invite" | "join" | "details" | null
  const [selectedTeam, setSelectedTeam] = useState(null);

  // data state
  const [teams, setTeams] = useState([]);
  const [invites, setInvites] = useState([]);

  // auth state
  const [authed, setAuthed] = useState(!!auth.currentUser);

  // watch auth changes
  useEffect(() => {
    if (auth.currentUser) {
      setAuthed(true);
      return;
    }
    const off = auth.onAuthStateChanged((u) => setAuthed(!!u));
    return () => off && off();
  }, []);

  // subscribe to teams + invites when authed
  useEffect(() => {
    if (!authed) return;
    const offTeams = observeMyTeams(setTeams);
    const offInvites = observeMyInvites(setInvites);
    return () => {
      offTeams && offTeams();
      offInvites && offInvites();
    };
  }, [authed]);

  // open details modal
  const handleCardClick = (team) => {
    setSelectedTeam(team);
    setModal("details");
  };

  // create team 
  const handleAddTeam = async ({ name, description, visibility }) => {
    const teamId = await createTeam({ name, description, visibility });
    return teamId;
  };

  // add members to team
  const handleAddMembers = async ({ teamId, memberUids }) => {
    await addMembers({ teamId, memberUids });
    setModal(null);
  };

  // send invite
  const handleInvite = async ({ teamId, email }) => {
    await inviteMember({ teamId, inviteeEmail: email });
    setModal(null);
  };

  // join public team 
  const handleJoinTeam = async ({ teamId }) => {
    await joinPublicTeam({ teamId });
    setModal(null);
  };

  // delete team
  const handleDeleteTeam = async (teamId) => {
    await deleteTeam({ teamId }); // existing team deletion
    // Delete group chat in backend
    await fetch(`${CHAT_BACKEND_URL}/deleteTeamAndGroupChat/${teamId}`, {
      method: "DELETE",
    });
    setModal(null);
  };

  return (
    <div className="teams-page">
      <section className="your-teams-panel">
        <div className="panel-title">Your Teams</div>
        <div className="teams-grid">
          {teams.length === 0 ? (
            <div className="team-card" style={{ justifyContent: "center" }}>
              You haven’t joined any teams yet.
            </div>
          ) : (
            teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => handleCardClick(team)}
              />
            ))
          )}
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
