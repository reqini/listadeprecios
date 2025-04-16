// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyATq9rkoUDtqLNu3ykydqcSRnKMn9dX1-o",
    authDomain: "catalogo-simple.firebaseapp.com",
    projectId: "catalogo-simple",
    storageBucket: "catalogo-simple.firebasestorage.app",
    messagingSenderId: "168562961302",
    appId: "1:168562961302:web:a19002aed0c97802224bb7",
    measurementId: "G-RC9CE84J3S"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png"
  });
});
