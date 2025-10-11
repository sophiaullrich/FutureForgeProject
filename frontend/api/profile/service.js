// Firestore admin helpers for profiles
const { db, admin } = require("../_admin");
const col = db.collection("profiles");

async function getProfileUID(uid) {
  const snap = await col.doc(uid).get();
  if (!snap.exists) return null;
  return snap.data();
}

async function updateProfileUID(uid, patch) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  await col.doc(uid).set({ ...patch, updatedAt: now }, { merge: true });
  const updated = await col.doc(uid).get();
  return updated.data();
}

module.exports = { getProfileUID, updateProfileUID };
