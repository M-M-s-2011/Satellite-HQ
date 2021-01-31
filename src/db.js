import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDXsW1-ilF31_tPrpswfC-GsVL1-nAxk0M",
  authDomain: "satellite-hq.firebaseapp.com",
  projectId: "satellite-hq",
  storageBucket: "satellite-hq.appspot.com",
  messagingSenderId: "887486522605",
  appId: "1:887486522605:web:3558abf51961c07b0258e4",
  measurementId: "G-ZGCP4JTMW7",
};

const db = firebase.initializeApp(firebaseConfig);

export default db;
