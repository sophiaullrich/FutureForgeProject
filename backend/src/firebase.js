var admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

var serviceAccount = require("../gobear-c15ba-firebase-adminsdk-fbsvc-0ebf01fe78.json"); 

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), 
    databaseURL: "/gobear-c15ba-firebase-adminsdk-fbsvc-0ebf01fe78.json",
    storageBucket: "gobear-c15ba.appspot.com"
  });
}

const db = admin.firestore(); 
const storage = getStorage().bucket();

module.exports = { admin, db, storage };
