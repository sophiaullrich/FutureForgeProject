const { db, admin } = require("../firebase");
const { FieldValue } = require("firebase-admin/firestore");

const NOTIFICATIONS_COLLECTION = "notifications";

async function createNotification(title, message) {
  console.log("Creating notification:", title, message);
  const docRef = await db.collection("notifications").add({
    title,
    message,
    read: false,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log("Notification ID:", docRef.id);
  return { id: docRef.id, title, message };
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
