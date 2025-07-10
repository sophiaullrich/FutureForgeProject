import React, { useState, useEffect } from 'react';
import { createTeam, listenToTeams, updateTeam, deleteTeam, addMemberToTeam, removeMemberFromTeam } from './services/teamService';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [editMode, setEditMode] = useState({});
  const [editName, setEditName] = useState({});
  const [memberInputs, setMemberInputs] = useState({});

  useEffect(() => {
    listenToTeams(setTeams);
  }, []);

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      createTeam(newTeamName);
      setNewTeamName('');
    }
  };

  const handleUpdateTeam = (id) => {
    if (editName[id]) {
      updateTeam(id, editName[id]);
      setEditMode({ ...editMode, [id]: false });
    }
  };

  const handleAddMember = (teamId) => {
    const memberName = memberInputs[teamId];
    if (memberName && memberName.trim()) {
      addMemberToTeam(teamId, memberName.trim());
      setMemberInputs({ ...memberInputs, [teamId]: '' });
    }
  };

  const handleRemoveMember = (teamId, memberName) => {
    removeMemberFromTeam(teamId, memberName);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teams</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="New team name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleAddTeam} className="px-4 py-2 border rounded bg-black text-white">
          Add Team
        </button>
      </div>

      <ul>
        {teams.map(team => (
          <li key={team.id} className="border p-4 rounded mb-4">
            {editMode[team.id] ? (
              <>
                <input
                  value={editName[team.id] || team.name}
                  onChange={(e) => setEditName({ ...editName, [team.id]: e.target.value })}
                  className="p-1 border rounded"
                />
                <button onClick={() => handleUpdateTeam(team.id)} className="ml-2 text-green-500">Save</button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{team.name}</span>
                  <div>
                    <button onClick={() => setEditMode({ ...editMode, [team.id]: true })} className="text-blue-500 mr-2">Edit</button>
                    <button onClick={() => deleteTeam(team.id)} className="text-red-500">Delete</button>
                  </div>
                </div>

                {/* Members List */}
                <ul className="mt-3 ml-4">
                  {team.members && Object.keys(team.members).map(member => (
                    <li key={member} className="flex justify-between items-center mb-1">
                      {member}
                      <button onClick={() => handleRemoveMember(team.id, member)} className="text-sm text-red-500">Remove</button>
                    </li>
                  ))}
                </ul>

                {/* Add Member */}
                <div className="mt-2 flex">
                  <input
                    type="text"
                    placeholder="New member name"
                    value={memberInputs[team.id] || ''}
                    onChange={(e) => setMemberInputs({ ...memberInputs, [team.id]: e.target.value })}
                    className="p-1 border rounded mr-2"
                  />
                  <button onClick={() => handleAddMember(team.id)} className="text-sm border px-2 rounded">Add</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamsPage;
