const { db, admin } = require("../firebase");
const notificationService = require("../notifications/notification.service");

async function createTask(req, res) {
  const { name, due, team, assignedEmail } = req.body;
  const user = req.user;

  if (!name || !due || !team || !assignedEmail) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const newTaskRef = await db.collection("tasks").add({
      name,
      due,
      team,
      assignedEmail,
      done: false,
      createdBy: user.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    await notificationService.createNotification(
      assignedEmail,
      "New Task Assigned",
      `You have been assigned a new task: "${name}"`
    );

    const createdTask = { id: newTaskRef.id, name, due, team, assignedEmail, done: false };
    res.status(201).json(createdTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
}

async function listTasks(req, res) {
  const user = req.user;
  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}

module.exports = { createTask, listTasks };
