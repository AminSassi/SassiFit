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

let state = load();

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
      timeline: [],
      bestStreak: saved.bestStreak || 0,
      mostRepsDay: saved.mostRepsDay || 0,
      daysCompleted: saved.daysCompleted || 0,
    };
    saveHistoryIfNeeded(saved);
    return newState;
  }
  if (!saved.completedExercises) saved.completedExercises = {};
  if (!saved.timeline) saved.timeline = [];
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
      if (history.length > 365) history.shift();
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
  if (n > 0) {
    const ex = getExercises().find(e => e.id === id);
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    state.timeline.push({ time, ex: ex ? ex.name : id, reps: n, ts: now.getTime() });
    if (state.timeline.length > 50) state.timeline.shift();
  }
  save(); renderCard(id); renderTimeline(); haptic();
  checkExerciseComplete(id);
  checkDayComplete();
  updateRecords();
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
      if (history.length > 365) history.shift();
      state.history = history;
      state.daysCompleted = (state.daysCompleted || 0) + 1;
    }
    state.streak = calculateStreak();
    if (state.streak > (state.bestStreak || 0)) state.bestStreak = state.streak;
    save();
    showToast('Daily goal achieved! 🎉');
  }
}

function updateRecords() {
  const total = getExercises().reduce((s, e) => s + (state.reps[e.id] || 0), 0);
  if (total > (state.mostRepsDay || 0)) state.mostRepsDay = total;
  save();
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
  state.timeline = [];
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
  renderTimeline();
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

function renderTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;
  const timeline = state.timeline || [];
  if (timeline.length === 0) {
    container.innerHTML = '<div class="timeline-empty">No reps logged yet today</div>';
    return;
  }
  container.innerHTML = '';
  timeline.slice().reverse().forEach(entry => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <span class="timeline-time">${entry.time}</span>
      <span class="timeline-dot"></span>
      <span class="timeline-ex">${entry.ex}</span>
      <span class="timeline-reps">+${entry.reps}</span>`;
    container.appendChild(item);
  });
}

function updateGreeting() {
  const h = new Date().getHours();
  const el = document.querySelector('.greeting');
  if (h < 12) el.textContent = 'Good Morning 🔥';
  else if (h < 17) el.textContent = 'Good Afternoon 💪';
  else el.textContent = 'Good Evening 🌙';
}

function openHistory() {
  const content = document.getElementById('historyContent');
  content.innerHTML = '';

  const bestStreak = state.bestStreak || 0;
  const currentStreak = calculateStreak();
  const mostReps = state.mostRepsDay || 0;
  const daysCompleted = state.daysCompleted || 0;
  const totalDays = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 86400000);

  content.innerHTML += `
    <div class="records-grid">
      <div class="record-card">
        <div class="record-value">${bestStreak}</div>
        <div class="record-label">Best Streak</div>
      </div>
      <div class="record-card">
        <div class="record-value">${currentStreak}</div>
        <div class="record-label">Current Streak</div>
      </div>
      <div class="record-card">
        <div class="record-value">${mostReps}</div>
        <div class="record-label">Most Reps / Day</div>
      </div>
      <div class="record-card">
        <div class="record-value">${daysCompleted}</div>
        <div class="record-label">Days Completed</div>
      </div>
    </div>`;

  content.innerHTML += '<p class="setting-label">Habit Heatmap</p>';

  const history = state.history || [];
  const now = new Date();
  for (let m = 0; m < 6; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();
    const isCurrentMonth = m === 0;

    let html = `<div class="heatmap-month"><div class="heatmap-label">${monthName}</div><div class="heatmap-grid">`;
    for (let i = 0; i < firstDay; i++) html += '<div class="heatmap-day"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toDateString();
      const isToday = isCurrentMonth && day === today;
      const isActive = history.includes(dateStr);
      let cls = 'heatmap-day';
      if (isToday) cls += ' today';
      if (isActive) cls += ' l4';
      html += `<div class="${cls}"></div>`;
    }
    html += '</div></div>';
    content.innerHTML += html;
  }

  document.getElementById('historyModal').classList.add('open');
}
function closeHistory() { document.getElementById('historyModal').classList.remove('open'); }

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
