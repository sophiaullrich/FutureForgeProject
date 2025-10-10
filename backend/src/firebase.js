const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const fs = require("fs");
const path = require("path");

let serviceAccount;

const localPath = path.join(__dirname, "../gobear-c15ba-firebase-adminsdk-fbsvc-0ebf01fe78.json");
if (fs.existsSync(localPath)) {
  console.log("Using local Firebase service account JSON");
  serviceAccount = require(localPath);
} else {
  console.log("Using Firebase credentials from environment variables");
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
}

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "gobear-c15ba.appspot.com",
    });
  }
} catch (err) {
  console.error("🔥 Firebase init error:", err);
}

const db = getFirestore();
const storage = getStorage().bucket("gobear-c15ba.appspot.com");

module.exports = { admin, db, storage };
