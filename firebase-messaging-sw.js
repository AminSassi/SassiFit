importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCMV6DHn4MWkxFje3tyLLE2XyGBRv98AGk",
  authDomain: "sassifit-b64de.firebaseapp.com",
  projectId: "sassifit-b64de",
  storageBucket: "sassifit-b64de.firebasestorage.app",
  messagingSenderId: "935160380751",
  appId: "1:935160380751:web:92deaffc53eee8f522993a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon.png'
  });
});
