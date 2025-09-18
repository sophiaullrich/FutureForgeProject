const {db, admin} = require('../firebase');
const col = db.collection('profiles');

async function getProfileUID(uid) {
  console.log(`Fetching profile for UID: ${uid}`);
  const snap = await col.doc(uid).get();
  if (!snap.exists) {
    console.log('Profile not found');
    return null;                     
  }
  const data = snap.data();
  console.log('Profile data:', data);
  return data;
}

async function updateProfileUID(uid, patch) {
  console.log(`Updating profile for UID: ${uid}`);
  console.log('Update data:', patch);

  const now = admin.firestore.FieldValue.serverTimestamp();

  await col.doc(uid).set({ ...patch, ...audit, updatedAt: now }, { merge: true });

  const updated = await col.doc(uid).get();
  console.log('Updated profile:', updated.data());
  return updated.data();
}

module.exports = { getProfileUID, updateProfileUID };