const { db, admin } = require("../firebase");
const NOTIFICATIONS_COLLECTION = "notifications";

async function createNotification(userId, title, message) {
  const docRef = await db.collection(NOTIFICATIONS_COLLECTION).add({
    userId,
    title,
    message,
    read: false,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  return { id: docRef.id, title, message };
}

async function getUserNotifications(userId) {
  const snapshot = await db.collection(NOTIFICATIONS_COLLECTION)
    .where("userId", "==", userId)
    .orderBy("timestamp", "desc")
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function markAsRead(notificationId, userId) {
  const notifRef = db.collection(NOTIFICATIONS_COLLECTION).doc(notificationId);
  const doc = await notifRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Notification not found or not owned by user");
  }

  return notifRef.update({ read: true });
}

module.exports = { createNotification, getUserNotifications, markAsRead };
