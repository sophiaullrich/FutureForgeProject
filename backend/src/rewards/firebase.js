const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://gobear-c15ba-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const db = admin.firestore();

module.exports = { admin, db };
