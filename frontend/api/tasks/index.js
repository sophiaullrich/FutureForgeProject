const { db, FieldValue } = require("../_admin.js");
const { authenticate } = require("../_auth.js");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = await authenticate(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });

  try {
    if (req.method === "POST") {
      const { name, due, description, team, assignedUsers, type } = req.body || {};
      if (!name || !due || !Array.isArray(assignedUsers) || !assignedUsers.length) {
        return res.status(400).json({ error: "Missing or invalid fields" });
      }
      const assignedEmails = assignedUsers.map(u => (u.email || "").toLowerCase());
      const ref = await db.collection("tasks").add({
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
      const doc = await ref.get();
      return res.status(201).json({ id: ref.id, ...doc.data() });
    }

    if (req.method === "GET") {
      const snap = await db
        .collection("tasks")
        .where("assignedEmails", "array-contains", (user.email || "").toLowerCase())
        .orderBy("timestamp", "desc")
        .get();
      const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.status(200).json(tasks);
    }

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error("Error in /api/tasks:", err);
    return res.status(500).json({ error: "server_error" });
  }
};
