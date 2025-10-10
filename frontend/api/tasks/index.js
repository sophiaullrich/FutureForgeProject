const { db, FieldValue } = require("../_admin.js");
const { authenticate } = require("../_auth.js");

// Optional: wire up notifications later if you have a module moved into frontend/lib
// const notificationService = require("../../lib/notifications/notification.service");

module.exports = async (req, res) => {
  const user = await authenticate(req);
  if (!user) { res.status(401).json({ error: "unauthorized" }); return; }

  try {
    if (req.method === "POST") {
      const { name, due, description, team, assignedUsers, type } = req.body || {};
      if (!name || !due || !Array.isArray(assignedUsers) || !assignedUsers.length) {
        res.status(400).json({ error: "Missing or invalid fields" });
        return;
      }

      const assignedEmails = assignedUsers.map(u => (u.email || "").toLowerCase());
      const newTaskRef = await db.collection("tasks").add({
        name,
        due,
        description: description || "",
        team: team || "",
        assignedUsers,
        assignedEmails,
        done: false,
        userId: user.uid,
        timestamp: FieldValue.serverTimestamp(),
        type: type || (team ? "team" : "private"),
      });

      // If you need notifications, uncomment and provide your module path:
      // for (const assignee of assignedUsers) {
      //   await notificationService.createNotification(
      //     assignee.uid,
      //     `New Task Assigned: ${name}`,
      //     `You have been assigned a task${team ? ` in team "${team}"` : ""}.`,
      //     { taskId: newTaskRef.id, taskDue: due, taskName: name, type: "task" }
      //   );
      // }

      const createdDoc = await newTaskRef.get();
      res.status(201).json({ id: newTaskRef.id, ...createdDoc.data() });
      return;
    }

    if (req.method === "GET") {
      const snap = await db
        .collection("tasks")
        .where("assignedEmails", "array-contains", (user.email || "").toLowerCase())
        .orderBy("timestamp", "desc")
        .get();

      const tasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(tasks);
      return;
    }

    res.setHeader("Allow", "POST, GET");
    res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error("Error in /api/tasks:", err);
    res.status(500).json({ error: "server_error" });
  }
};
