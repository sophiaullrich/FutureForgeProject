var admin = require("firebase-admin");

// place service account key(json file) under backend folder, not src
var serviceAccount = require("../gobear-c15ba-firebase-adminsdk-fbsvc-0ebf01fe78.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gobear-c15ba-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.firestore(); 

module.exports = { admin, db };
