const notificationService = require("./notification.service");

async function create(req, res) {
  const { title, message } = req.body;
  const userId = req.user.uid;

  if (!title || !message) return res.status(400).json({ error: "Missing title or message" });

  const result = await notificationService.createNotification(userId, title, message);
  res.status(201).json({ id: result.id });
}

async function list(req, res) {
  const userId = req.user.uid;
  const notifications = await notificationService.getUserNotifications(userId);
  res.json(notifications);
}

async function markRead(req, res) {
  const { id } = req.params;
  const userId = req.user.uid;

  try {
    await notificationService.markAsRead(id, userId);
    res.json({ success: true });
  } catch (err) {
    res.status(403).json({ error: "Not allowed" });
  }
}

module.exports = { create, list, markRead };
