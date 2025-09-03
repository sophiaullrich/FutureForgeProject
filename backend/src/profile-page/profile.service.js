const { get } = require('react-native/Libraries/TurboModule/TurboModuleRegistry');
const {db, admin} = require('../firebase');
const col = db.collection('users');

async function getProfileUID(uid) {
    const snap = await col.doc(uid).get();
    if (!snap.exists) throw new Error('User not found');
    return snap.data();
}

async function updateProfileUID(uid, patch) {
    const now = admin.firestore.FieldValue.serverTimestamp();
    await col.doc(uid).set({ ...patch, updatedAt: now }, { merge: true });
    return getProfileUID(uid);
}

module.exports = { getProfileUID, updateProfileUID };