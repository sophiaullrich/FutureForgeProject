const admin = require("firebase-admin");

if (!admin.apps.length) {
  const creds = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  admin.initializeApp({
    credential: admin.credential.cert(creds),
    storageBucket: "gobear-c15ba.appspot.com",
  });

  console.log("🚀 Firebase Admin initialized on Vercel");
}

module.exports = {
  admin,
  firestore: admin.firestore(),
  FieldValue: admin.firestore.FieldValue,
};
