const notificationService = require("./notification.service");

async function create(req, res) {
  console.log("POST /notifications called", req.body);
  const { title, message } = req.body;
  if (!title || !message) return res.status(400).json({ error: "Missing title or message" });
  const result = await notificationService.createNotification(title, message);
  console.log("Notification created:", result);
  res.status(201).json({ id: result.id });
}


async function list(req, res) {
  const notifications = await notificationService.getAllNotifications();
  res.json(notifications);
}

async function markRead(req, res) {
  const { id } = req.params;
  await notificationService.markAsRead(id);
  res.json({ success: true });
}

module.exports = { create, list, markRead };
