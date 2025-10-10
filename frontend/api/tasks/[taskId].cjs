// frontend/api/tasks/[taskId].cjs
const { db } = require("../_admin.cjs");
const { authenticate } = require("../_auth.cjs");

// CORS helper
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // tighten later
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end(); // preflight ok

  const user = await authenticate(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });

  const { taskId } = req.query;

  try {
    if (req.method === "PUT") {
      if (!taskId || typeof taskId !== "string" || !taskId.trim()) {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      // (optional) whitelist allowed fields to avoid accidental overwrites
      const input = req.body || {};
      const allowed = {};
      if (typeof input.done === "boolean") allowed.done = input.done;
      if (typeof input.name === "string") allowed.name = input.name;
      if (typeof input.description === "string") allowed.description = input.description;
      if (typeof input.due === "string") allowed.due = input.due;
      if (typeof input.team === "string") allowed.team = input.team;

      if (Object.keys(allowed).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const taskRef = db.collection("tasks").doc(taskId);
      await taskRef.update(allowed);
      const updatedDoc = await taskRef.get();
      return res.status(200).json({ id: taskId, ...updatedDoc.data() });
    }

    if (req.method === "DELETE") {
      if (!taskId || typeof taskId !== "string" || !taskId.trim()) {
        return res.status(400).json({ error: "Invalid task ID" });
      }
      const taskRef = db.collection("tasks").doc(taskId);
      const snap = await taskRef.get();
      if (!snap.exists) return res.status(404).json({ error: "Task not found" });

      await taskRef.delete();
      return res.json({ success: true, message: "Task deleted successfully" });
    }

    res.setHeader("Allow", "PUT, DELETE, OPTIONS");
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error("Error in /api/tasks/[taskId]:", err);
    return res.status(500).json({ error: "server_error" });
  }
};
