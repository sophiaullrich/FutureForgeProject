const express = require("express");
const admin = require("firebase-admin");
const fs = require("fs").promises;
const path = require("path");
const serviceAccount = require("../../gobear-c15ba-firebase-adminsdk-fbsvc-0ebf01fe78.json");
require("dotenv").config();
const { getApps } = require("firebase-admin/app");

const router = express.Router();

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

router.get("/messages/:chatName", async (req, res) => {
  try {
    const chatName = req.params.chatName;
    const snapshot = await db.ref(`messages/${chatName}`).once("value");
    const val = snapshot.val() || {};
    const arr = Object.values(val);
    res.json(arr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/messages/:chatName", async (req, res) => {
  try {
    const chatName = req.params.chatName;
    const { text, from, to } = req.body;
    if (!text || !from || !to) return res.status(400).send("missing fields");
    const newMsgRef = db.ref(`messages/${chatName}`).push();
    await newMsgRef.set({
      text,
      from,
      to,
      timestamp: Date.now(),
    });
    res.status(201).json({ id: newMsgRef.key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const DATA_FILE = path.join(__dirname, "messagedUsers.json");

async function readData() {
  try {
    const s = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(s || "{}");
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
}
async function writeData(obj) {
  await fs.writeFile(DATA_FILE, JSON.stringify(obj, null, 2), "utf8");
}

router.get("/messagedUsers/:uid", async (req, res) => {
  const uid = req.params.uid;
  const data = await readData();
  res.json(data[uid] || []);
});

router.post("/messagedUsers/:uid", async (req, res) => {
  const uid = req.params.uid;
  const { user } = req.body;
  if (!user || !user.id) return res.status(400).send("missing user");
  const data = await readData();
  data[uid] = data[uid] || [];
  if (!data[uid].some(u => u.id === user.id)) data[uid].push(user);
  await writeData(data);
  res.json(data[uid]);
});

module.exports = router;