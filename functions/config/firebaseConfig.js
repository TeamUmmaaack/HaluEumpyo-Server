const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const dotenv = require('dotenv');
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: 'haluempyo.firebaseapp.com',
  projectId: 'haluempyo',
  storageBucket: 'haluempyo.appspot.com',
  messagingSenderId: '294514026994',
  appId: '1:294514026994:web:aa57783a26d41060a0636b',
  measurementId: 'G-8CKQ4KQ9E8',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

module.exports = { firebaseApp, firebaseAuth, firebaseConfig };
