// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyATq9rkoUDtqLNu3ykydqcSRnKMn9dX1-o",
  authDomain: "catalogo-simple.firebaseapp.com",
  projectId: "catalogo-simple",
  storageBucket: "catalogo-simple.firebasestorage.app",
  messagingSenderId: "168562961302",
  appId: "1:168562961302:web:a19002aed0c97802224bb7",
  measurementId: "G-RC9CE84J3S"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
