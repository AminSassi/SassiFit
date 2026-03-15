import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js';

const firebaseConfig = {
  apiKey: "AIzaSyCMV6DHn4MWkxFje3tyLLE2XyGBRv98AGk",
  authDomain: "sassifit-b64de.firebaseapp.com",
  projectId: "sassifit-b64de",
  storageBucket: "sassifit-b64de.firebasestorage.app",
  messagingSenderId: "935160380751",
  appId: "1:935160380751:web:92deaffc53eee8f522993a"
};

const VAPID_KEY = "GG3uOBH5oYTu6j1h3eSnhesAJuA5lwXan0i61kxkKIQ";
const BACKEND_URL = "https://sassifit-backend.onrender.com";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function registerPush() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) return null;

    localStorage.setItem('fcmToken', token);

    const intervalMins = JSON.parse(localStorage.getItem('sassifit') || '{}').reminderMins || 60;
    await fetch(`${BACKEND_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, intervalMins })
    });

    return token;
  } catch (e) {
    console.error('Push registration failed:', e);
    return null;
  }
}

export async function updateInterval(intervalMins) {
  const token = localStorage.getItem('fcmToken');
  if (!token) return;
  await fetch(`${BACKEND_URL}/update-interval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, intervalMins })
  });
}

onMessage(messaging, payload => {
  new Notification(payload.notification.title, { body: payload.notification.body });
});
