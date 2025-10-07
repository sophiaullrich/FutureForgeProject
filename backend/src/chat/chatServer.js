const express = require("express");
const admin = require("firebase-admin");
const fs = require("fs").promises;
const path = require("path");
const serviceAccount = require("../../gobear-c15ba-firebase-adminsdk-fbsvc-0ebf01fe78.json");
require("dotenv").config();
const { getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { createTeamChatBox, deleteTeamAndGroupChat } = require("./teamChat");

const router = express.Router();

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();
const firestore = getFirestore();

// GET messages for a chat (Firestore)
router.get("/messages/:chatKey", async (req, res) => {
  try {
    const chatKey = req.params.chatKey;
    const snap = await firestore
      .collection("messages")
      .doc(chatKey)
      .collection("items")
      .orderBy("timestamp")
      .get();
    const arr = snap.docs.map(doc => doc.data());
    res.json(arr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new message to a chat (Firestore)
router.post("/messages/:chatKey", async (req, res) => {
  try {
    const chatKey = req.params.chatKey;
    const { text, from, to } = req.body;
    if (!text || !from || !to) return res.status(400).send("missing fields");
    const msg = {
      text,
      from,
      to,
      timestamp: Date.now(),
    };
    await firestore
      .collection("messages")
      .doc(chatKey)
      .collection("items")
      .add(msg);
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET messaged users for a user (Firestore)
router.get("/messagedUsers/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const snap = await firestore
      .collection("messagedUsers")
      .doc(uid)
      .collection("users")
      .get();
    const arr = snap.docs.map(doc => doc.data());
    res.json(arr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add a messaged user for a user (Firestore)
router.post("/messagedUsers/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { user } = req.body;
    if (!user || !user.id) return res.status(400).send("missing user");
    // Use user.id as the document ID for uniqueness
    await firestore
      .collection("messagedUsers")
      .doc(uid)
      .collection("users")
      .doc(user.id)
      .set(user, { merge: true });
    // Return updated list
    const snap = await firestore
      .collection("messagedUsers")
      .doc(uid)
      .collection("users")
      .get();
    const arr = snap.docs.map(doc => doc.data());
    res.json(arr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// creates a team chat box
router.post("/createTeamChatBox", async (req, res) => {
  try {
    const { teamId, teamName, memberUids } = req.body;
    await createTeamChatBox(teamId, teamName, memberUids);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// deletes a team and its group chat
router.delete("/deleteTeamAndGroupChat/:teamId", async (req, res) => {
  try {
    await deleteTeamAndGroupChat(req.params.teamId);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;