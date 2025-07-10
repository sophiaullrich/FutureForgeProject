// src/TeamManager.js
import React, { useState, useEffect } from "react";
import {
  createTeam,
  addMember,
  removeMember,
  updateTeam,
  getTeam
} from "./firebase/teamService";

const TeamManager = () => {
  const [teamId, setTeamId] = useState("team123");
  const [teamData, setTeamData] = useState(null);
  const [newMember, setNewMember] = useState("");
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    const data = await getTeam(teamId);
    if (data) {
      setTeamData(data);
      setTeamName(data.name);
      setDescription(data.description);
    } else {
      setTeamData(null);
    }
  };

  const handleCreateTeam = async () => {
    const newTeam = {
      name: teamName,
      description,
      createdBy: "user001",
      members: {
        user001: true
      }
    };
    await createTeam(teamId, newTeam);
    setMessage("Team created");
    fetchTeam();
  };

  const handleAddMember = async () => {
    if (newMember) {
      await addMember(teamId, newMember);
      setNewMember("");
      setMessage("Member added");
      fetchTeam();
    }
  };

  const handleRemoveMember = async (userId) => {
    await removeMember(teamId, userId);
    setMessage("Member removed");
    fetchTeam();
  };

  const handleUpdateTeam = async () => {
    await updateTeam(teamId, {
      name: teamName,
      description
    });
    setMessage("Team updated");
    fetchTeam();
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px" }}>
      <h2>Team Management</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>Team ID: </label>
        <input value={teamId} onChange={(e) => setTeamId(e.target.value)} />
        <button onClick={fetchTeam}>Load Team</button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Team Name: </label>
        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Description: </label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handleCreateTeam}>Create Team</button>
        <button onClick={handleUpdateTeam}>Update Team</button>
      </div>

      {teamData && (
        <>
          <h3>Members</h3>
          <ul>
            {teamData.members &&
              Object.keys(teamData.members).map((id) => (
                <li key={id}>
                  {id} <button onClick={() => handleRemoveMember(id)}>Remove</button>
                </li>
              ))}
          </ul>

          <div style={{ marginTop: "1rem" }}>
            <input
              placeholder="User ID to add"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
            />
            <button onClick={handleAddMember}>Add Member</button>
          </div>
        </>
      )}

      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
};

export default TeamManager;
