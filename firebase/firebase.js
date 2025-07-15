const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const firebaseConfig = require('./firebaseConfig');

// Initialize Firebase with client SDK
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

module.exports = {
  app,
  db,
};
