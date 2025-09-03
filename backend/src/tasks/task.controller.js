const { db, admin } = require("../firebase");
const notificationService = require("../notifications/notification.service");

async function createTask(req, res) {
  const { name, due, team, assignedUsers } = req.body; 
  const user = req.user;

  if (!name || !due || !team || !assignedUsers || !Array.isArray(assignedUsers) || assignedUsers.length === 0) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  try {
    const assignedEmails = assignedUsers.map(u => u.email);

    const newTaskRef = await db.collection("tasks").add({
      name,
      due,
      team,
      assignedUsers,
      assignedEmails,
      done: false,
      userId: user.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    for (const u of assignedUsers) {
      await notificationService.createNotification(
        u.email,
        "New Task Assigned",
        `You have been assigned a new task: "${name}"`
      );
    }

    const createdTask = {
      id: newTaskRef.id,
      name,
      due,
      team,
      assignedUsers,
      done: false,
    };

    res.status(201).json(createdTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
}

async function listTasks(req, res) {
  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}

async function updateTask(req, res) {
  const taskId = req.params.taskId;
  const updateData = req.body;

  try {
    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) return res.status(404).json({ error: "Task not found" });

    const task = taskDoc.data();
    const userEmail = req.user.email;
    if (req.user.uid !== task.userId && !task.assignedEmails.includes(userEmail)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await taskRef.update(updateData);
    const updatedDoc = await taskRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
}

async function deleteTask(req, res) {
  const taskId = req.params.taskId;

  try {
    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) return res.status(404).json({ error: "Task not found" });

    const task = taskDoc.data();
    const userEmail = req.user.email;
    if (req.user.uid !== task.userId && !task.assignedEmails.includes(userEmail)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await taskRef.delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
}

module.exports = { createTask, listTasks, updateTask, deleteTask };
