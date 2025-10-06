const { db, admin } = require("../firebase");
const notificationService = require("../notifications/notification.service");

async function createTask(req, res) {
  const { name, due, description, team, assignedUsers, type } = req.body;
  const user = req.user;

  if (!name || !due || !Array.isArray(assignedUsers) || assignedUsers.length === 0) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  try {
    const assignedEmails = assignedUsers.map((u) => u.email.toLowerCase());
    const newTaskRef = await db.collection("tasks").add({
      name,
      due,
      description: description || "",
      team: team || "",
      assignedUsers,
      assignedEmails,
      done: false,
      userId: user.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: type || (team ? "team" : "private"),
    });

    for (const assignee of assignedUsers) {
      await notificationService.createNotification(
        assignee.uid,
        `New Task Assigned: ${name}`,
        `You have been assigned a task${team ? ` in team "${team}"` : ""}.`,
        {
          taskId: newTaskRef.id,
          taskDue: due,
          taskName: name,
          type: "task",
        }
      );
      console.log(`Notification sent to: ${assignee.email}`);
    }

    const createdDoc = await newTaskRef.get();
    res.status(201).json({ id: newTaskRef.id, ...createdDoc.data() });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
}

async function listTasks(req, res) {
  const user = req.user;
  try {
    const snapshot = await db
      .collection("tasks")
      .where("assignedEmails", "array-contains", user.email.toLowerCase())
      .orderBy("timestamp", "desc")
      .get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to list tasks" });
  }
}

async function updateTask(req, res) {
  const { taskId } = req.params;
  const updates = req.body;
  try {
    const taskRef = db.collection("tasks").doc(taskId);
    await taskRef.update(updates);
    const updatedDoc = await taskRef.get();
    res.json({ id: taskId, ...updatedDoc.data() });
  } catch {
    res.status(500).json({ error: "Failed to update task" });
  }
}

async function deleteTask(req, res) {
  const { taskId } = req.params;
  if (!taskId || typeof taskId !== "string" || taskId.trim() === "") {
    return res.status(400).json({ error: "Invalid task ID" });
  }
  try {
    const taskRef = db.collection("tasks").doc(taskId);
    const doc = await taskRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Task not found" });
    await taskRef.delete();
    console.log(`Deleted task ${taskId}`);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete task" });
  }
}

module.exports = { createTask, listTasks, updateTask, deleteTask };
