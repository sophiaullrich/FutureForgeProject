const notificationService = require("./notification.service");

async function create(req, res) {
  const { title, message } = req.body;
  const userId = req.user.uid;

  if (!title || !message)
    return res.status(400).json({ error: "Missing title or message" });

  try {
    const result = await notificationService.createNotification(
      userId,
      title,
      message
    );
    res.status(201).json({ id: result.id });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
}

async function list(req, res) {
  try {
    const notifications = await notificationService.getUserNotifications(
      req.user.uid
    );
    res.json(notifications);
  } catch (err) {
    console.error("Error listing notifications:", err);
    res.status(500).json({ error: "Failed to list notifications" });
  }
}

async function markRead(req, res) {
  const { id } = req.params;
  const userId = req.user.uid;

  try {
    await notificationService.markAsRead(id, userId);
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(403).json({ error: "Not allowed" });
  }
}

module.exports = { create, list, markRead };
