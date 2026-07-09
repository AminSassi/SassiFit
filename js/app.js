const DEFAULT_EXERCISES = [
  { id: 'pushups', name: 'Push-ups', icon: '💪' },
  { id: 'situps',  name: 'Sit-ups',  icon: '🔥' },
  { id: 'pullups', name: 'Pull-ups', icon: '🏋️' },
  { id: 'squats',  name: 'Squats',   icon: '🦵' },
];

const REMINDERS = ["Get off the couch. Now.", "Your muscles are waiting.", "No excuses. Just reps.", "Every rep counts.", "Time to sweat."];
const REMINDER_HOURS = [8, 12, 18, 21];

let state = load();

function load() {
  const today = new Date().toDateString();
  const s = JSON.parse(localStorage.getItem('sassifit') || '{}');
  if (s.date !== today) {
    const customs = s.customExercises || [];
    const reps = {};
    [...DEFAULT_EXERCISES, ...customs].forEach(e => reps[e.id] = 0);
    const ns = { date: today, goal: s.goal || 100, reps, notifs: s.notifs, customExercises: customs, history: s.history || [], completedExercises: {}, timeline: [], bestStreak: s.bestStreak || 0, mostRepsDay: s.mostRepsDay || 0, daysCompleted: s.daysCompleted || 0, lastCompleteDate: null };
    if (s.date) {
      const total = Object.values(s.reps || {}).reduce((a, b) => a + b, 0);
      if (total >= (DEFAULT_EXERCISES.length + customs.length) * (s.goal || 100)) {
        const h = s.history || [];
        if (!h.includes(s.date)) { h.push(s.date); ns.history = h; ns.daysCompleted = (s.daysCompleted || 0) + 1; }
        ns.bestStreak = Math.max(s.bestStreak || 0, streak(h));
      }
      ns.mostRepsDay = Math.max(s.mostRepsDay || 0, total);
    }
    return ns;
  }
  if (!s.completedExercises) s.completedExercises = {};
  if (!s.timeline) s.timeline = [];
  return s;
}

function save() { localStorage.setItem('sassifit', JSON.stringify(state)); }
function exercises() { return [...DEFAULT_EXERCISES, ...(state.customExercises || [])]; }

function addReps(id, n) {
  state.reps[id] = Math.max(0, (state.reps[id] || 0) + n);
  if (n > 0) {
    const ex = exercises().find(e => e.id === id);
    const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    state.timeline.push({ t, ex: ex ? ex.name : id, n });
    if (state.timeline.length > 50) state.timeline.shift();
  }
  save();
  render();
  if (navigator.vibrate) navigator.vibrate(n > 0 ? 10 : 5);
  checkComplete(id);
}

function checkComplete(id) {
  const r = state.reps[id] || 0;
  const g = state.goal;
  const was = state.completedExercises[id];
  if (r >= g && !was) {
    state.completedExercises[id] = true;
    save();
    toast(exercises().find(e => e.id === id).name + ' complete!');
    if (navigator.vibrate) navigator.vibrate(30);
  } else if (r < g && was) {
    delete state.completedExercises[id];
    save();
  }
}

function checkDay() {
  const ex = exercises();
  const total = ex.reduce((s, e) => s + (state.reps[e.id] || 0), 0);
  if (total >= ex.length * state.goal && state.lastCompleteDate !== state.date) {
    state.lastCompleteDate = state.date;
    const h = state.history || [];
    if (!h.includes(state.date)) { h.push(state.date); state.history = h; state.daysCompleted = (state.daysCompleted || 0) + 1; }
    state.bestStreak = Math.max(state.bestStreak || 0, streak(h));
    state.mostRepsDay = Math.max(state.mostRepsDay || 0, total);
    save();
    toast('Daily goal achieved! 🎉');
  }
}

function streak(h) {
  if (!h || h.length === 0) return 0;
  let s = 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    if (h.includes(d.toDateString())) s++;
    else if (i > 0) break;
  }
  return s;
}

function resetAll() {
  exercises().forEach(e => state.reps[e.id] = 0);
  state.completedExercises = {};
  state.timeline = [];
  save();
  render();
}

function toast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2000);
}

function render() {
  const ex = exercises();
  const total = ex.reduce((s, e) => s + (state.reps[e.id] || 0), 0);
  const goal = ex.length * state.goal;
  const pct = Math.min(100, Math.round((total / goal) * 100));
  const remaining = Math.max(0, goal - total);
  const done = total >= goal;

  const h = new Date().getHours();
  document.getElementById('greeting').textContent = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';

  if (done) {
    document.getElementById('heroContent').style.display = 'none';
    document.getElementById('heroComplete').style.display = 'block';
  } else {
    document.getElementById('heroContent').style.display = 'block';
    document.getElementById('heroComplete').style.display = 'none';
    const circ = document.getElementById('progressCircle');
    circ.style.strokeDashoffset = 327 - (327 * pct / 100);
    document.getElementById('heroPct').textContent = pct + '%';
    document.getElementById('heroRemaining').textContent = remaining + ' reps remaining';
  }

  const s = streak(state.history || []);
  const sl = document.getElementById('streakLine');
  if (s > 0) {
    document.getElementById('streakText').textContent = s + ' day streak';
    sl.style.display = 'block';
  } else {
    sl.style.display = 'none';
  }

  const container = document.getElementById('exercises');
  container.innerHTML = '';
  ex.forEach(e => {
    const r = state.reps[e.id] || 0;
    const p = Math.min(100, Math.round((r / state.goal) * 100));
    const complete = r >= state.goal;
    const card = document.createElement('div');
    card.className = 'ex-card' + (complete ? ' ex-done' : '');
    card.innerHTML = `
      <div class="ex-top">
        <span class="ex-name">${e.icon} ${e.name}</span>
        <span class="ex-reps"><span>${r}</span> / ${state.goal}</span>
      </div>
      <div class="ex-bar"><div class="ex-bar-fill" style="width:${p}%"></div></div>
      <div class="ex-btns">
        <button class="ex-btn minus" onclick="addReps('${e.id}',-1)">−</button>
        <button class="ex-btn" onclick="addReps('${e.id}',1)">+1</button>
        <button class="ex-btn primary" onclick="addReps('${e.id}',10)">+10</button>
        <button class="ex-btn" onclick="addReps('${e.id}',50)">+50</button>
      </div>`;
    container.appendChild(card);
  });

  renderTimeline();
}

function renderTimeline() {
  const wrap = document.getElementById('exercises');
  const tl = state.timeline || [];
  if (tl.length === 0) return;
  const div = document.createElement('div');
  div.className = 'timeline-wrap';
  div.innerHTML = '<div style="font-size:13px;font-weight:700;margin-bottom:8px">Today Timeline</div>';
  tl.slice().reverse().forEach(e => {
    div.innerHTML += `<div class="timeline-item"><span class="timeline-time">${e.t}</span><span class="timeline-dot"></span><span class="timeline-ex">${e.ex}</span><span class="timeline-reps">+${e.n}</span></div>`;
  });
  wrap.appendChild(div);
}

function openHistory() {
  const c = document.getElementById('historyContent');
  const bs = state.bestStreak || 0;
  const cs = streak(state.history || []);
  const mr = state.mostRepsDay || 0;
  const dc = state.daysCompleted || 0;
  c.innerHTML = `<div class="records-grid">
    <div class="record-card"><div class="record-value">${bs}</div><div class="record-label">Best Streak</div></div>
    <div class="record-card"><div class="record-value">${cs}</div><div class="record-label">Current</div></div>
    <div class="record-card"><div class="record-value">${mr}</div><div class="record-label">Most Reps</div></div>
    <div class="record-card"><div class="record-value">${dc}</div><div class="record-label">Days Done</div></div>
  </div><p class="setting-label">Habit Heatmap</p>`;
  const hist = state.history || [];
  const now = new Date();
  for (let m = 0; m < 6; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const y = d.getFullYear(), mo = d.getMonth();
    const first = new Date(y, mo, 1).getDay();
    const days = new Date(y, mo + 1, 0).getDate();
    const name = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let h = `<div class="heatmap-month"><div class="heatmap-label">${name}</div><div class="heatmap-grid">`;
    for (let i = 0; i < first; i++) h += '<div class="heatmap-day"></div>';
    for (let day = 1; day <= days; day++) {
      const ds = new Date(y, mo, day).toDateString();
      const isToday = m === 0 && day === now.getDate();
      h += `<div class="heatmap-day${hist.includes(ds) ? ' done' : ''}${isToday ? ' today' : ''}"></div>`;
    }
    c.innerHTML += h + '</div></div>';
  }
  document.getElementById('historyModal').classList.add('open');
}
function closeHistory() { document.getElementById('historyModal').classList.remove('open'); }

function openSettings() {
  document.getElementById('goalInput').value = state.goal;
  updateNotifBtn();
  renderCustomList();
  document.getElementById('settingsModal').classList.add('open');
}
function closeSettings() { document.getElementById('settingsModal').classList.remove('open'); }

function saveGoal() {
  const v = parseInt(document.getElementById('goalInput').value);
  if (v > 0) { state.goal = v; save(); render(); closeSettings(); }
}

function renderCustomList() {
  const l = document.getElementById('customList');
  l.innerHTML = '';
  (state.customExercises || []).forEach(e => {
    l.innerHTML += `<div class="custom-item"><span style="font-weight:700">${e.name}</span><button class="custom-remove" onclick="removeCustom('${e.id}')">Remove</button></div>`;
  });
}

function addCustom() {
  const inp = document.getElementById('customInput');
  const name = inp.value.trim();
  if (!name) return;
  const id = 'c_' + Date.now();
  if (!state.customExercises) state.customExercises = [];
  state.customExercises.push({ id, name, icon: '⭐' });
  state.reps[id] = 0;
  save(); inp.value = ''; renderCustomList(); render();
}

function removeCustom(id) {
  state.customExercises = (state.customExercises || []).filter(e => e.id !== id);
  delete state.reps[id];
  save(); renderCustomList(); render();
}

function updateNotifBtn() {
  const btn = document.getElementById('notifBtn');
  const info = document.getElementById('notifInfo');
  if (!('Notification' in window)) { btn.textContent = 'Not Supported'; return; }
  if (Notification.permission === 'granted') { btn.textContent = '✓ Enabled'; btn.style.color = '#30d158'; if (info) info.textContent = '8AM, 12PM, 6PM, 9PM when open.'; }
  else if (Notification.permission === 'denied') { btn.textContent = 'Blocked'; btn.style.color = '#ff4444'; if (info) info.textContent = 'Enable in browser settings.'; }
  else { btn.textContent = 'Enable Notifications'; if (info) info.textContent = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.navigator.standalone ? 'Install to Home Screen for reminders.' : ''; }
}

function requestNotifications() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(p => { if (p === 'granted') { state.notifs = true; save(); new Notification('SassiFit', { body: 'Reminders on.' }); } updateNotifBtn(); });
}

function checkReminders() {
  if (Notification.permission !== 'granted') return;
  const now = new Date();
  if (REMINDER_HOURS.includes(now.getHours()) && now.getMinutes() === 0) {
    const total = exercises().reduce((s, e) => s + (state.reps[e.id] || 0), 0);
    if (total < exercises().length * state.goal) new Notification('SassiFit', { body: REMINDERS[Math.floor(Math.random() * REMINDERS.length)] });
  }
}

render();
updateNotifBtn();
setInterval(checkReminders, 60000);
