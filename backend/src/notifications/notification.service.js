const { db } = require("../firebase");
const { FieldValue } = require("firebase-admin/firestore");

const NOTIFICATIONS_COLLECTION = "notifications";

async function createNotification(title, message) {
  return await db.collection(NOTIFICATIONS_COLLECTION).add({
    title,
    message,
    read: false,
    timestamp: FieldValue.serverTimestamp()
  });
}

async function getAllNotifications() {
  const snapshot = await db.collection(NOTIFICATIONS_COLLECTION)
    .orderBy("timestamp", "desc")
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function markAsRead(notificationId) {
  return await db.collection(NOTIFICATIONS_COLLECTION)
    .doc(notificationId)
    .update({ read: true });
}

module.exports = {
  createNotification,
  getAllNotifications,
  markAsRead
};
