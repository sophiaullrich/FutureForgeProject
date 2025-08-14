var admin = require("firebase-admin");

// service account key(json file) placed just under backend folder, not src
var serviceAccount = require("../gobear-c15ba-firebase-adminsdk-fbsvc-76919e5f66.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gobear-c15ba-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.firestore(); 

module.exports = { admin, db };
