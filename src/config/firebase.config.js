const {initializeApp} = require("firebase/app")
const { getAnalytics } = require("firebase/analytics");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCri6PJuNSGTI2I5ZddmyJ2ruhTH1E8ms8",
  authDomain: "demonodejs-dc545.firebaseapp.com",
  projectId: "demonodejs-dc545",
  storageBucket: "demonodejs-dc545.appspot.com",
  messagingSenderId: "182544114213",
  appId: "1:182544114213:web:3f13c0017da622e11715cc",
  measurementId: "G-2D4E26V3MR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
exports.storageFireBase = require("firebase/storage").getStorage(app);
