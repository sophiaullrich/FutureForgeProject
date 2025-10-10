const { db } = require("../_admin.js");
const { authenticate } = require("../_auth.js");

module.exports = async (req, res) => {
  const user = await authenticate(req);
  if (!user) { res.status(401).json({ error: "unauthorized" }); return; }

  const { taskId } = req.query;

  try {
    if (req.method === "PUT") {
      const updates = req.body || {};
      const taskRef = db.collection("tasks").doc(taskId);
      await taskRef.update(updates);
      const updatedDoc = await taskRef.get();
      res.status(200).json({ id: taskId, ...updatedDoc.data() });
      return;
    }

    if (req.method === "DELETE") {
      if (!taskId || typeof taskId !== "string" || !taskId.trim()) {
        res.status(400).json({ error: "Invalid task ID" });
        return;
      }
      const taskRef = db.collection("tasks").doc(taskId);
      const doc = await taskRef.get();
      if (!doc.exists) { res.status(404).json({ error: "Task not found" }); return; }
      await taskRef.delete();
      res.json({ success: true, message: "Task deleted successfully" });
      return;
    }

    res.setHeader("Allow", "PUT, DELETE");
    res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error("Error in /api/tasks/[taskId]:", err);
    res.status(500).json({ error: "server_error" });
  }
};
