// src/firebase/teamService.js
import { db, ref, set, update, remove, get, child } from "./firebase";

// Create a team
export const createTeam = async (teamId, teamData) => {
  await set(ref(db, `teams/${teamId}`), teamData);
};

// Add member
export const addMember = async (teamId, userId) => {
  await set(ref(db, `teams/${teamId}/members/${userId}`), true);
};

// Remove member
export const removeMember = async (teamId, userId) => {
  await remove(ref(db, `teams/${teamId}/members/${userId}`));
};

// Update team info
export const updateTeam = async (teamId, updates) => {
  await update(ref(db, `teams/${teamId}`), updates);
};

// Get team info
export const getTeam = async (teamId) => {
  const snapshot = await get(child(ref(db), `teams/${teamId}`));
  return snapshot.exists() ? snapshot.val() : null;
};
