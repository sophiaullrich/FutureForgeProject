const { db, admin } = require("../firebase");
const NOTIFICATIONS_COLLECTION = "notifications";

async function createNotification(userId, title, message, extra = {}) {
  if (!userId || typeof userId !== "string") return;

  const docRef = await db.collection(NOTIFICATIONS_COLLECTION).add({
    userId,
    title,
    message,
    read: false,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ...extra,
  });

  await docRef.update({ notifId: docRef.id });
  console.log(`Notification created for UID: ${userId}`);

  return { id: docRef.id, notifId: docRef.id, title, message, ...extra };
}

module.exports = { createNotification };
