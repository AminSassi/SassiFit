const VAPID_KEY = "GG3uOBH5oYTu6j1h3eSnhesAJuA5lwXan0i61kxkKIQ";
const BACKEND_URL = "https://sassifit-backend.onrender.com";

firebase.initializeApp({
  apiKey: "AIzaSyCMV6DHn4MWkxFje3tyLLE2XyGBRv98AGk",
  authDomain: "sassifit-b64de.firebaseapp.com",
  projectId: "sassifit-b64de",
  storageBucket: "sassifit-b64de.firebasestorage.app",
  messagingSenderId: "935160380751",
  appId: "1:935160380751:web:92deaffc53eee8f522993a"
});

window.registerPush = async function() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') { alert('Permission denied'); return null; }

    const swReg = await navigator.serviceWorker.register('/SassiFit/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    const messaging = firebase.messaging();
    const token = await messaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
    if (!token) { alert('No token — try again'); return null; }

    localStorage.setItem('fcmToken', token);
    const intervalMins = JSON.parse(localStorage.getItem('sassifit') || '{}').reminderMins || 60;
    const res = await fetch(`${BACKEND_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, intervalMins })
    });
    if (res.ok) alert('✓ Registered! Reminders every ' + intervalMins + ' min.');
    else alert('Backend error: ' + res.status);
    return token;
  } catch (e) {
    alert('Error: ' + e.message);
    return null;
  }
};

window.testNotification = async function() {
  const token = localStorage.getItem('fcmToken');
  if (!token) { alert('Enable notifications first'); return; }
  const res = await fetch(`${BACKEND_URL}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (res.ok) alert('Test sent! Check in a few seconds.');
  else alert('Failed: ' + res.status);
};

window.updateInterval = async function(intervalMins) {
  const token = localStorage.getItem('fcmToken');
  if (!token) return;
  await fetch(`${BACKEND_URL}/update-interval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, intervalMins })
  });
};
