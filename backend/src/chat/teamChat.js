const admin = require("firebase-admin");

async function createTeamChatBox(teamId, teamName) {
  if (!teamId || !teamName) throw new Error("Missing team info for chat box creation.");

  // chat metadata lives here
  await admin.firestore().collection("chats").doc(teamId).set({
    name: teamName,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, teamId };
}

// Delete team and its group chat + all messages
async function deleteTeamAndGroupChat(teamId) {
  if (!teamId) throw new Error("Missing teamId");

  await admin.firestore().collection("chats").doc(teamId).delete();

  const messagesRef = admin.firestore()
    .collection("messages")
    .doc(teamId)
    .collection("items");

  const snapshot = await messagesRef.get();
  const batch = admin.firestore().batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  return { success: true, teamId };
}

module.exports = { createTeamChatBox, deleteTeamAndGroupChat };