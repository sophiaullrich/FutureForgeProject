const { db } = require("../firebase");

async function getDashboard(req, res) {
  const uid = req.user.uid;
  const email = (req.user.email || "").toLowerCase();

  try {
    const teamSnap = await db
      .collection("teams")
      .where("members", "array-contains", uid)
      .get();
    const teams = teamSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const taskSnap = await db
      .collection("tasks")
      .where("assignedEmails", "array-contains", email)
      .get();
    const tasks = taskSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ teams, tasks, points: 0, badges: 0 });
  } catch (err) {
    console.error("Error fetching dashboard:", err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
}

module.exports = { getDashboard };
