const DEFAULT_EXERCISES = [
  { id: 'pushups', name: 'Push-ups', color: 'green', c: 'c-green', bg: 'bg-green' },
  { id: 'situps',  name: 'Sit-ups',  color: 'red',   c: 'c-red',   bg: 'bg-red'   },
  { id: 'pullups', name: 'Pull-ups', color: 'amber', c: 'c-amber', bg: 'bg-amber' },
  { id: 'squats',  name: 'Squats',   color: 'blue',  c: 'c-blue',  bg: 'bg-blue'  },
];

const COLORS = ['green', 'red', 'amber', 'blue'];
const COLOR_MAP = {
  green: { c: 'c-green', bg: 'bg-green' },
  red:   { c: 'c-red',   bg: 'bg-red'   },
  amber: { c: 'c-amber', bg: 'bg-amber' },
  blue:  { c: 'c-blue',  bg: 'bg-blue'  },
};

const REMINDER_MESSAGES = [
  "Get off the couch. Now.",
  "Your muscles are waiting.",
  "No excuses. Just reps.",
  "Every rep counts. Go do them.",
  "Time to sweat. You know what to do.",
];
const REMINDER_HOURS = [8, 12, 18, 21];
const BATCH_SIZE = 10;

let state = load();
let lastCompletedExercises = {};

function load() {
  const today = new Date().toDateString();
  const saved = JSON.parse(localStorage.getItem('sassifit') || '{}');
  if (saved.date !== today) {
    const customExercises = saved.customExercises || [];
    const allExercises = [...DEFAULT_EXERCISES, ...customExercises];
    const reps = {};
    allExercises.forEach(ex => reps[ex.id] = 0);
    const newState = {
      date: today,
      goal: saved.goal || 100,
      reps,
      notifs: saved.notifs || false,
      customExercises,
      history: saved.history || [],
      streak: saved.streak || 0,
      lastCompleteDate: saved.lastCompleteDate || null,
      completedExercises: {},
    };
    saveHistoryIfNeeded(saved);
    return newState;
  }
  if (!saved.completedExercises) saved.completedExercises = {};
  return saved;
}

function saveHistoryIfNeeded(prev) {
  if (!prev.date) return;
  const total = Object.values(prev.reps || {}).reduce((s, v) => s + v, 0);
  const goal = prev.goal || 100;
  const exCount = DEFAULT_EXERCISES.length + (prev.customExercises || []).length;
  if (total >= exCount * goal) {
    const history = prev.history || [];
    if (!history.includes(prev.date)) {
      history.push(prev.date);
      if (history.length > 30) history.shift();
      localStorage.setItem('sassifit', JSON.stringify({ ...prev, history }));
    }
  }
}

function save() { localStorage.setItem('sassifit', JSON.stringify(state)); }

function getExercises() {
  return [...DEFAULT_EXERCISES, ...(state.customExercises || [])];
}

function addReps(id, n) {
  state.reps[id] = Math.max(0, (state.reps[id] || 0) + n);
  save(); renderCard(id); updateTopBar(); haptic();
  checkExerciseComplete(id);
  checkDayComplete();
}

function haptic() {
  if (navigator.vibrate) navigator.vibrate(10);
}

function hapticSuccess() {
  if (navigator.vibrate) navigator.vibrate(30);
}

function checkExerciseComplete(id) {
  const reps = state.reps[id] || 0;
  const goal = state.goal;
  const wasComplete = state.completedExercises && state.completedExercises[id];
  if (reps >= goal && !wasComplete) {
    if (!state.completedExercises) state.completedExercises = {};
    state.completedExercises[id] = true;
    save();
    showExerciseCompleteToast(id);
    glowCard(id);
    hapticSuccess();
  } else if (reps < goal && wasComplete) {
    if (state.completedExercises) delete state.completedExercises[id];
    save();
    unglowCard(id);
  }
}

function showExerciseCompleteToast(id) {
  const ex = getExercises().find(e => e.id === id);
  if (!ex) return;
  showToast(ex.name + ' goal complete!');
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function glowCard(id) {
  const card = document.getElementById('card-' + id);
  if (card) card.classList.add('card-complete');
}

function unglowCard(id) {
  const card = document.getElementById('card-' + id);
  if (card) card.classList.remove('card-complete');
}

function checkDayComplete() {
  const exercises = getExercises();
  const total = exercises.reduce((s, e) => s + (state.reps[e.id] || 0), 0);
  const goal = exercises.length * state.goal;
  if (total >= goal && state.lastCompleteDate !== state.date) {
    state.lastCompleteDate = state.date;
    const history = state.history || [];
    if (!history.includes(state.date)) {
      history.push(state.date);
      if (history.length > 30) history.shift();
      state.history = history;
    }
    state.streak = calculateStreak();
    save();
    showToast('Daily goal achieved!');
  }
}

function calculateStreak() {
  const history = state.history || [];
  if (history.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    if (history.includes(ds)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function resetAll() {
  getExercises().forEach(e => {
    state.reps[e.id] = 0;
    unglowCard(e.id);
  });
  state.completedExercises = {};
  save(); render();
}

function updateTopBar() {
  const total = getExercises().reduce((s, e) => s + (state.reps[e.id] || 0), 0);
  const goal = getExercises().length * state.goal;
  document.getElementById('topBar').style.width = Math.min(100, (total / goal) * 100) + '%';
}

function renderCard(id) {
  const ex = getExercises().find(e => e.id === id);
  if (!ex) return;
  const reps = state.reps[id] || 0;
  const goal = state.goal;
  const pct = Math.min(100, (reps / goal) * 100);
  const remaining = Math.max(0, goal - reps);
  const card = document.getElementById('card-' + id);
  if (!card) return;
  card.querySelector('.rep-count').textContent = reps;
  card.querySelector('.rep-goal').textContent = '/ ' + goal;
  card.querySelector('.prog-bar').style.width = pct + '%';
  const remainingEl = card.querySelector('.rep-remaining');
  if (remainingEl) {
    if (reps >= goal) {
      remainingEl.textContent = 'Goal completed!';
      remainingEl.classList.add('completed');
    } else {
      remainingEl.textContent = remaining + ' reps remaining';
      remainingEl.classList.remove('completed');
    }
  }
  const batchRow = card.querySelector('.batch-row');
  const batches = Math.ceil(goal / BATCH_SIZE);
  const full = Math.floor(reps / BATCH_SIZE);
  const partial = reps % BATCH_SIZE;
  batchRow.innerHTML = '';
  for (let i = 0; i < batches; i++) {
    const b = document.createElement('div');
    b.className = 'batch';
    if (i < full) { b.classList.add(ex.bg); }
    else if (i === full && partial > 0) { b.classList.add(ex.bg); b.style.opacity = (partial / BATCH_SIZE).toFixed(2); }
    batchRow.appendChild(b);
  }
}

function render() {
  document.getElementById('dateLabel').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  document.getElementById('goalInput').value = state.goal;
  const container = document.getElementById('cards');
  container.innerHTML = '';
  getExercises().forEach(ex => {
    const card = document.createElement('div');
    card.id = 'card-' + ex.id;
    card.className = 'card';
    if (state.completedExercises && state.completedExercises[ex.id]) card.classList.add('card-complete');
    card.innerHTML = `
      <div class="card-top">
        <span class="ex-name">${ex.name}</span>
        <div class="rep-display">
          <span class="rep-count ${ex.c}">0</span>
          <span class="rep-goal">/ ${state.goal}</span>
        </div>
      </div>
      <div class="rep-remaining"></div>
      <div class="batch-row"></div>
      <div class="prog-wrap"><div class="prog-bar ${ex.bg}"></div></div>
      <div class="btn-row">
        <button class="btn" onclick="addReps('${ex.id}',1)">+1</button>
        <button class="btn" onclick="addReps('${ex.id}',5)">+5</button>
        <button class="btn btn-primary" onclick="addReps('${ex.id}',10)">+10</button>
        <button class="btn btn-quick" onclick="addReps('${ex.id}',50)">+50</button>
        <button class="btn btn-minus" onclick="addReps('${ex.id}',-1)">−</button>
      </div>`;
    container.appendChild(card);
    renderCard(ex.id);
  });
  updateTopBar();
  renderStreak();
}

function renderStreak() {
  const streakEl = document.getElementById('streakBadge');
  if (streakEl) {
    const streak = calculateStreak();
    if (streak > 0) {
      streakEl.textContent = streak + ' day streak';
      streakEl.style.display = 'block';
    } else {
      streakEl.style.display = 'none';
    }
  }
}

function openStats() {
  const content = document.getElementById('statsContent');
  content.innerHTML = '';
  const streak = calculateStreak();
  if (streak > 0) {
    content.innerHTML += `<div class="stat-row"><span class="stat-name">Streak</span><span class="stat-num" style="color:#f59e0b">${streak} days</span></div>`;
  }
  getExercises().forEach(ex => {
    const reps = state.reps[ex.id] || 0;
    const pct = Math.min(100, Math.round((reps / state.goal) * 100));
    const remaining = Math.max(0, state.goal - reps);
    const status = reps >= state.goal ? '✓' : remaining + ' left';
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <span class="stat-name">${ex.name}</span>
      <div class="stat-right">
        <div class="stat-bar-wrap"><div class="stat-bar ${ex.bg}" style="width:${pct}%"></div></div>
        <span class="stat-num ${ex.c}">${reps}</span>
      </div>`;
    content.appendChild(row);
  });
  const history = state.history || [];
  if (history.length > 0) {
    content.innerHTML += `<p class="setting-label" style="margin-top:20px">Recent Activity</p>`;
    history.slice(-7).reverse().forEach(date => {
      content.innerHTML += `<div class="stat-row"><span class="stat-name">${new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span><span class="stat-num" style="color:#30d158">✓</span></div>`;
    });
  }
  document.getElementById('statsModal').classList.add('open');
}
function closeStats() { document.getElementById('statsModal').classList.remove('open'); }

function openSettings() {
  document.getElementById('goalInput').value = state.goal;
  updateNotifBtn();
  renderCustomExercises();
  document.getElementById('settingsModal').classList.add('open');
}
function closeSettings() { document.getElementById('settingsModal').classList.remove('open'); }

function saveGoal() {
  const v = parseInt(document.getElementById('goalInput').value);
  if (v > 0) { state.goal = v; save(); render(); closeSettings(); }
}

function renderCustomExercises() {
  const list = document.getElementById('customExercisesList');
  if (!list) return;
  list.innerHTML = '';
  (state.customExercises || []).forEach(ex => {
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <span class="stat-name">${ex.name}</span>
      <button class="btn btn-minus" style="flex:0 0 auto;padding:6px 12px;font-size:12px;color:#ff375f" onclick="removeCustomExercise('${ex.id}')">Remove</button>`;
    list.appendChild(row);
  });
}

function addCustomExercise() {
  const nameInput = document.getElementById('customExerciseInput');
  const name = nameInput.value.trim();
  if (!name) return;
  const id = 'custom_' + Date.now();
  const color = COLORS[(state.customExercises || []).length % COLORS.length];
  const exercise = { id, name, color, ...COLOR_MAP[color] };
  if (!state.customExercises) state.customExercises = [];
  state.customExercises.push(exercise);
  state.reps[id] = 0;
  save();
  nameInput.value = '';
  renderCustomExercises();
  render();
}

function removeCustomExercise(id) {
  state.customExercises = (state.customExercises || []).filter(ex => ex.id !== id);
  delete state.reps[id];
  save();
  renderCustomExercises();
  render();
}

function updateNotifBtn() {
  const btn = document.getElementById('notifBtn');
  const notifInfo = document.getElementById('notifInfo');
  if (!('Notification' in window)) {
    btn.textContent = 'Notifications Not Supported';
    btn.style.color = '#ff375f';
    if (notifInfo) notifInfo.textContent = 'Your browser does not support notifications.';
    return;
  }
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && !window.navigator.standalone) {
    if (notifInfo) notifInfo.textContent = 'On iPhone, install SassiFit to your Home Screen for reminders to work.';
  }
  if (Notification.permission === 'granted') {
    btn.textContent = '✓ Reminders Enabled';
    btn.style.color = '#30d158';
    if (notifInfo) notifInfo.textContent = 'You\'ll get reminders at 8AM, 12PM, 6PM, 9PM when the app is open.';
  } else if (Notification.permission === 'denied') {
    btn.textContent = 'Blocked — Enable in Settings';
    btn.style.color = '#ff375f';
    if (notifInfo) notifInfo.textContent = 'Notifications blocked. Enable them in your browser settings.';
  } else {
    btn.textContent = 'Enable Notifications';
    btn.style.color = 'rgba(235,235,245,0.75)';
    if (notifInfo) notifInfo.textContent = '';
  }
}

function requestNotifications() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(p => {
    if (p === 'granted') {
      state.notifs = true; save();
      new Notification('SassiFit', { body: 'Reminders on. No more excuses.' });
    }
    updateNotifBtn();
  });
}

function checkReminders() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  if (REMINDER_HOURS.includes(now.getHours()) && now.getMinutes() === 0) {
    const total = getExercises().reduce((s, e) => s + (state.reps[e.id] || 0), 0);
    if (total < getExercises().length * state.goal) {
      new Notification('SassiFit', { body: REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)] });
    }
  }
}

function checkInAppReminder() {
  const total = getExercises().reduce((s, e) => s + (state.reps[e.id] || 0), 0);
  const goal = getExercises().length * state.goal;
  if (total < goal && total > 0) {
    const remaining = goal - total;
    showToast(remaining + ' reps to go today');
  }
}

render();
updateNotifBtn();
setInterval(checkReminders, 60000);
setTimeout(checkInAppReminder, 2000);
