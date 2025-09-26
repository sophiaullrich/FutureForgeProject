const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("../../gobear-c15ba-firebase-adminsdk-fbsvc-0ebf01fe78.json");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
});

const db = admin.database();

// Get all messages
app.get("/api/chat/messages", async (req, res) => {
  try {
    const snapshot = await db.ref("messages").once("value");
    res.json(snapshot.val() || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new message
app.post("/api/chat/messages", async (req, res) => {
  try {
    const { text } = req.body;
    const newMsgRef = db.ref("messages").push();
    await newMsgRef.set({
      text,
      timestamp: Date.now(),
    });
    res.status(201).json({ id: newMsgRef.key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.CHAT_PORT || 5001;
app.listen(PORT, () => console.log(`Chat backend running on port ${PORT}`));