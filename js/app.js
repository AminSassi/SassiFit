const DEFAULT_EXERCISES = [
  { id: 'pushups', name: 'Push-ups', icon: '💪', sub: 'Upper body strength', colorClass: 'pushups' },
  { id: 'situps',  name: 'Sit-ups',  icon: '🔥', sub: 'Core workout', colorClass: 'situps' },
  { id: 'pullups', name: 'Pull-ups', icon: '🏋️', sub: 'Back & arms', colorClass: 'pullups' },
  { id: 'squats',  name: 'Squats',   icon: '🦵', sub: 'Lower body power', colorClass: 'squats' },
];

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
  save(); renderCard(id); haptic();
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
    hapticSuccess();
  } else if (reps < goal && wasComplete) {
    if (state.completedExercises) delete state.completedExercises[id];
    save();
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
    showToast('Daily goal achieved! 🎉');
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
  getExercises().forEach(e => state.reps[e.id] = 0);
  state.completedExercises = {};
  save(); render();
}

function renderCard(id) {
  const ex = getExercises().find(e => e.id === id);
  if (!ex) return;
  const reps = state.reps[id] || 0;
  const goal = state.goal;
  const pct = Math.min(100, Math.round((reps / goal) * 100));
  const remaining = Math.max(0, goal - reps);
  const isComplete = reps >= goal;
  const card = document.getElementById('card-' + id);
  if (!card) return;
  card.querySelector('.rep-count').textContent = reps;
  card.querySelector('.rep-goal').textContent = '/ ' + goal;
  card.querySelector('.ex-progress-bar').style.width = pct + '%';
  card.querySelector('.ex-pct').textContent = pct + '%';
  const badge = card.querySelector('.ex-badge');
  if (badge) {
    if (isComplete) {
      badge.textContent = '✓ Complete';
      badge.className = 'ex-badge badge-complete';
    } else {
      badge.className = 'ex-badge badge-active';
      badge.textContent = '';
    }
  }
  const remainingEl = card.querySelector('.remaining-text');
  if (remainingEl) {
    if (isComplete) {
      remainingEl.textContent = 'Goal completed!';
      remainingEl.classList.add('done');
    } else {
      remainingEl.textContent = remaining + ' reps remaining';
      remainingEl.classList.remove('done');
    }
  }
  if (isComplete) {
    card.classList.add('card-complete');
  } else {
    card.classList.remove('card-complete');
  }
}

function render() {
  const exercises = getExercises();
  const container = document.getElementById('cards');
  container.innerHTML = '';
  exercises.forEach(ex => {
    const card = document.createElement('div');
    card.id = 'card-' + ex.id;
    card.className = 'exercise-card-wrap';
    card.innerHTML = `
      <div class="exercise-card ${ex.colorClass}">
        <div class="ex-icon ${ex.colorClass}">${ex.icon}</div>
        <div class="ex-info">
          <div class="ex-name">${ex.name}</div>
          <div class="ex-sub">${ex.sub}</div>
          <div class="ex-progress-wrap">
            <div class="ex-progress"><div class="ex-progress-bar ${ex.colorClass}"></div></div>
            <span class="ex-pct">0%</span>
          </div>
        </div>
        <div class="rep-display">
          <span class="rep-count">0</span>
          <span class="rep-goal">/ ${state.goal}</span>
        </div>
        <span class="ex-badge badge-active"></span>
      </div>
      <div class="remaining-text"></div>
      <div class="ex-actions">
        <button class="ex-btn" onclick="addReps('${ex.id}',1)">+1</button>
        <button class="ex-btn" onclick="addReps('${ex.id}',5)">+5</button>
        <button class="ex-btn ex-btn-primary" onclick="addReps('${ex.id}',10)">+10</button>
        <button class="ex-btn ex-btn-quick" onclick="addReps('${ex.id}',50)">+50</button>
        <button class="ex-btn ex-btn-minus" onclick="addReps('${ex.id}',-1)">−</button>
      </div>`;
    container.appendChild(card);
    renderCard(ex.id);
  });
  renderStreak();
  renderCalendar();
  updateGreeting();
}

function renderStreak() {
  const banner = document.getElementById('streakBanner');
  const text = document.getElementById('streakText');
  const streak = calculateStreak();
  if (streak > 0) {
    text.textContent = streak + ' day streak — keep it up!';
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

function renderCalendar() {
  const container = document.getElementById('calendarContainer');
  if (!container) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const history = state.history || [];
  let html = `<div class="calendar-header"><span class="calendar-month">${monthName}</span></div>`;
  html += '<div class="calendar-grid">';
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  days.forEach(d => { html += `<div class="calendar-day-label">${d}</div>`; });
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(year, month, d).toDateString();
    const isToday = d === today;
    const isActive = history.includes(dateStr);
    let cls = 'calendar-day';
    if (isToday) cls += ' today';
    if (isActive) cls += ' active';
    html += `<div class="${cls}">${d}</div>`;
  }
  html += '</div>';
  const completedDays = history.filter(d => {
    const dt = new Date(d);
    return dt.getMonth() === month && dt.getFullYear() === year;
  }).length;
  html += `<div class="calendar-stats"><span>${completedDays} / ${daysInMonth} days completed</span></div>`;
  container.innerHTML = html;
}

function updateGreeting() {
  const h = new Date().getHours();
  const el = document.querySelector('.greeting');
  if (h < 12) el.textContent = 'Good Morning 🔥';
  else if (h < 17) el.textContent = 'Good Afternoon 💪';
  else el.textContent = 'Good Evening 🌙';
}

function openStats() {
  const content = document.getElementById('statsContent');
  content.innerHTML = '';
  const streak = calculateStreak();
  if (streak > 0) {
    content.innerHTML += `<div class="stat-row"><span class="stat-name">🔥 Streak</span><span class="stat-num" style="color:var(--accent)">${streak} days</span></div>`;
  }
  const exercises = getExercises();
  const total = exercises.reduce((s, e) => s + (state.reps[e.id] || 0), 0);
  const goal = exercises.length * state.goal;
  const overallPct = Math.min(100, Math.round((total / goal) * 100));
  content.innerHTML += `<div class="stat-row"><span class="stat-name">Today's Progress</span><span class="stat-num">${overallPct}%</span></div>`;
  exercises.forEach(ex => {
    const reps = state.reps[ex.id] || 0;
    const pct = Math.min(100, Math.round((reps / state.goal) * 100));
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <span class="stat-name">${ex.icon} ${ex.name}</span>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="stat-bar-wrap"><div class="stat-bar ex-progress-bar ${ex.colorClass}" style="width:${pct}%"></div></div>
        <span class="stat-num">${reps}</span>
      </div>`;
    content.appendChild(row);
  });
  const history = state.history || [];
  if (history.length > 0) {
    content.innerHTML += `<p class="setting-label" style="margin-top:20px">Recent Activity</p>`;
    history.slice(-7).reverse().forEach(date => {
      content.innerHTML += `<div class="stat-row"><span class="stat-name">${new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span><span class="stat-num" style="color:var(--accent)">✓</span></div>`;
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
    row.className = 'custom-list-item';
    row.innerHTML = `<span style="font-size:14px;font-weight:700;color:var(--gray2)">${ex.name}</span><button class="remove-btn" onclick="removeCustomExercise('${ex.id}')">Remove</button>`;
    list.appendChild(row);
  });
}

function addCustomExercise() {
  const nameInput = document.getElementById('customExerciseInput');
  const name = nameInput.value.trim();
  if (!name) return;
  const id = 'custom_' + Date.now();
  const exercise = { id, name, icon: '⭐', sub: 'Custom exercise', colorClass: 'custom' };
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

function openAddExercise() {
  document.getElementById('addExerciseModal').classList.add('open');
}
function closeAddExercise() {
  document.getElementById('addExerciseModal').classList.remove('open');
}

function addNewExercise() {
  const input = document.getElementById('newExerciseInput');
  const name = input.value.trim();
  if (!name) return;
  const id = 'custom_' + Date.now();
  const exercise = { id, name, icon: '⭐', sub: 'Custom exercise', colorClass: 'custom' };
  if (!state.customExercises) state.customExercises = [];
  state.customExercises.push(exercise);
  state.reps[id] = 0;
  save();
  input.value = '';
  closeAddExercise();
  render();
}

function switchTab(tab) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (tab === 'home') {
    document.querySelector('.nav-item').classList.add('active');
  }
}

function updateNotifBtn() {
  const btn = document.getElementById('notifBtn');
  const notifInfo = document.getElementById('notifInfo');
  if (!('Notification' in window)) {
    btn.textContent = 'Notifications Not Supported';
    btn.style.color = 'var(--red)';
    if (notifInfo) notifInfo.textContent = 'Your browser does not support notifications.';
    return;
  }
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && !window.navigator.standalone) {
    if (notifInfo) notifInfo.textContent = 'On iPhone, install SassiFit to your Home Screen for reminders.';
  }
  if (Notification.permission === 'granted') {
    btn.textContent = '✓ Reminders Enabled';
    btn.style.color = '#30d158';
    if (notifInfo) notifInfo.textContent = 'Reminders at 8AM, 12PM, 6PM, 9PM when app is open.';
  } else if (Notification.permission === 'denied') {
    btn.textContent = 'Blocked — Enable in Settings';
    btn.style.color = 'var(--red)';
    if (notifInfo) notifInfo.textContent = 'Notifications blocked. Enable in browser settings.';
  } else {
    btn.textContent = 'Enable Notifications';
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
