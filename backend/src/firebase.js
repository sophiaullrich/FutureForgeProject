var admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

var serviceAccount = require("../gobear-c15ba-firebase-adminsdk-fbsvc-0ebf01fe78.json"); 

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), 
    databaseURL: "https://gobear-c15ba-default-rtdb.asia-southeast1.firebasedatabase.app/",
    storageBucket: "gobear-c15ba.appspot.com"
  });
}

const db = admin.firestore(); 
const storage = getStorage().bucket("gobear-c15ba.appspot.com");

module.exports = { admin, db, storage };
