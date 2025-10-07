const admin = require("firebase-admin");

async function createTeamChatBox(teamId, teamName) {
  if (!teamId || !teamName) {
    throw new Error("Missing team info for chat box creation.");
  }

  // Only store minimal data since members are in /teams/{teamId}
  await admin.firestore().collection("groupChats").doc(teamId).set({
    name: teamName,
    createdAt: Date.now(),
  });

  return { success: true, teamId };
}

// Delete team and associated group chat
async function deleteTeamAndGroupChat(teamId) {
  if (!teamId) throw new Error("Missing teamId");

  await admin.firestore().collection("groupChats").doc(teamId).delete();

  // Delete all group chat messages
  const messagesRef = admin.firestore().collection("groupMessages").doc(teamId).collection("items");
  const snapshot = await messagesRef.get();
  const batch = admin.firestore().batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  return { success: true, teamId };
}

module.exports = { createTeamChatBox, deleteTeamAndGroupChat };