import { db } from '../firebase';
import { ref, set, push, update, remove, onValue } from 'firebase/database';

// Create Team
export const createTeam = (name) => {
  const teamRef = push(ref(db, 'teams'));
  set(teamRef, { name, members: {} });
};

// Listen to Teams
export const listenToTeams = (callback) => {
  const teamsRef = ref(db, 'teams');
  onValue(teamsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const teamsArray = Object.keys(data).map(id => ({ id, ...data[id] }));
    callback(teamsArray);
  });
};

// Update Team Name
export const updateTeam = (teamId, newName) => {
  const teamRef = ref(db, `teams/${teamId}`);
  update(teamRef, { name: newName });
};

// Delete Team
export const deleteTeam = (teamId) => {
  const teamRef = ref(db, `teams/${teamId}`);
  remove(teamRef);
};

// Add Member
export const addMemberToTeam = (teamId, memberName) => {
  const teamRef = ref(db, `teams/${teamId}/members/${memberName}`);
  set(teamRef, true);
};

// Remove Member
export const removeMemberFromTeam = (teamId, memberName) => {
  const memberRef = ref(db, `teams/${teamId}/members/${memberName}`);
  remove(memberRef);
};
