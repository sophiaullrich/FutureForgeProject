const {db, admin} = require('../firebase');
const col = db.collection('profiles');

async function getProfileUID(uid) {
    console.log(`Fetching profile for UID: ${uid}`);
    const snap = await col.doc(uid).get();
    if (!snap.exists) {
        console.log('Profile not found');
        throw new Error('User not found');
    }
    console.log('Profile data:', snap.data());
    return snap.data();
}

async function updateProfileUID(uid, patch) {
    console.log(`Updating profile for UID: ${uid}`);
    console.log('Update data:', patch);
    const now = admin.firestore.FieldValue.serverTimestamp();
    await col.doc(uid).set({ ...patch, updatedAt: now }, { merge: true });
    const updated = await getProfileUID(uid);
    console.log('Updated profile:', updated);
    return updated;
}

module.exports = { getProfileUID, updateProfileUID };