// frontend/api/_admin.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  let creds;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Preferred path: single JSON env var
    creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    if (creds.private_key?.includes("\\n")) {
      creds.private_key = creds.private_key.replace(/\\n/g, "\n");
    }
  } else {
    // Fallback: three separate vars (be sure they are correct)
    creds = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: creds.project_id || creds.projectId,
      clientEmail: creds.client_email || creds.clientEmail,
      privateKey: creds.private_key || creds.privateKey,
    }),
    storageBucket: "gobear-c15ba.appspot.com",
  });

  console.log("🚀 Firebase Admin initialized on Vercel");
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

module.exports = { admin, db, FieldValue };
