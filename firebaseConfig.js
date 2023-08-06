
const firebaseConfig = {
    apiKey: "AIzaSyDo2egg9BROHPNyg4WEPNzVRS9iT-kCYVg",
    authDomain: "postsimage.firebaseapp.com",
    projectId: "postsimage",
    storageBucket: "postsimage.appspot.com",
    messagingSenderId: "786312678096",
    appId: "1:786312678096:web:60ec234a9d17a44aa9ecd5",
    measurementId: "G-N230ZKEE82"
  };


// Initialize Firebase
// firebaseConfig.js
const admin = require('firebase-admin');
const serviceAccount = require('./keys/serviceAccountKey.json'); // Replace with your serviceAccountKey.json file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://postsimage.appspot.com/', // Replace with your Firebase Storage bucket URL
});

module.exports = admin;

