const MESSAGES = [
  "💪 Get off the couch. Workout time.",
  "🔥 You said you'd train today. No excuses.",
  "⚡ SassiFit says: move your body NOW.",
  "🏋️ Your muscles are waiting. Don't disappoint them.",
  "😤 Skipping again? Really?",
  "🚨 WORKOUT ALERT — this is not a drill.",
  "👊 Champions train even when they don't feel like it.",
  "💥 Your future self will thank you. Go train.",
];

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function isNotificationSupported() {
  return 'Notification' in window;
}

export function getPermissionStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function sendNotification(title, body) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
  });
}

export function scheduleWorkoutReminders(times) {
  // Clear existing
  const ids = JSON.parse(localStorage.getItem('reminderIds') || '[]');
  ids.forEach(id => clearInterval(id));

  if (!times || times.length === 0) {
    localStorage.setItem('reminderIds', '[]');
    return;
  }

  const newIds = [];

  times.forEach(time => {
    // Check every minute if it's time
    const id = setInterval(() => {
      const now = new Date();
      const [h, m] = time.split(':').map(Number);
      if (now.getHours() === h && now.getMinutes() === m) {
        const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        sendNotification('SassiFit 🏋️', msg);
      }
    }, 60000);
    newIds.push(id);
  });

  localStorage.setItem('reminderIds', JSON.stringify(newIds));
}

export function testNotification() {
  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  sendNotification('SassiFit 🏋️', msg);
}
