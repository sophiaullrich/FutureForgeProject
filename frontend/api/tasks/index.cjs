// frontend/api/tasks/index.cjs
const { db, FieldValue } = require("../_admin.cjs");
const { authenticate } = require("../_auth.cjs");

// ---- CORS helpers
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // tighten to your origin later
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = async (req, res) => {
  setCors(res);

  // Handle preflight so the browser doesn't see a 405 on OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Authenticate (expects Authorization: Bearer <idToken> if your _auth.cjs does that)
  let user = null;
  try {
    user = await authenticate(req);
  } catch (e) {
    console.error("authenticate() failed:", e);
  }
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    if (req.method === "POST") {
      const body = req.body || {};
      const {
        name,
        due,
        description,
        team,
        assignedUsers,
        type
      } = body;

      // Basic validation
      if (!name || !due || !Array.isArray(assignedUsers) || assignedUsers.length === 0) {
        return res.status(400).json({ error: "Missing or invalid fields" });
      }

      const assignedEmails = assignedUsers.map(u => (u.email || "").toLowerCase());

      const newTaskRef = await db.collection("tasks").add({
        name,
        due,
        description: description || "",
        team: team || "",
        assignedUsers,           // full objects you pass in
        assignedEmails,          // for efficient queries
        done: false,
        userId: user.uid,
        timestamp: FieldValue.serverTimestamp(),
        type: type || (team ? "team" : "private"),
      });

      // If you need notifications later, wire them up here.

      const createdDoc = await newTaskRef.get();
      return res.status(201).json({ id: newTaskRef.id, ...createdDoc.data() });
    }

    if (req.method === "GET") {
      const email = (user.email || "").toLowerCase();
      const snap = await db
        .collection("tasks")
        .where("assignedEmails", "array-contains", email)
        .orderBy("timestamp", "desc")
        .get();

      const tasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(tasks);
    }

    // Anything else → 405
    res.setHeader("Allow", "POST, GET, OPTIONS");
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error("Error in /api/tasks:", err);
    return res.status(500).json({ error: "server_error" });
  }
};
