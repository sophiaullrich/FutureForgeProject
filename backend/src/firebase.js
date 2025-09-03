var admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

// place service account key(json file) under backend folder, not src
var serviceAccount = require("../gobear-c15ba-firebase-adminsdk-fbsvc-0ebf01fe78.json"); 

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), 
    databaseURL: "https://gobear-c15ba-default-rtdb.asia-southeast1.firebasedatabase.app/"
  });
}

const db = admin.firestore(); 
const storage = getStorage().bucket();

module.exports = { admin, db, storage };
