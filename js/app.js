const EXERCISES = [
  { id: 'pushups', name: 'Push-ups', bg: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  { id: 'situps',  name: 'Sit-ups',  bg: 'bg-rose-500',    ring: 'ring-rose-500/30',    text: 'text-rose-400',    border: 'border-rose-500/20' },
  { id: 'pullups', name: 'Pull-ups', bg: 'bg-amber-500',   ring: 'ring-amber-500/30',   text: 'text-amber-400',   border: 'border-amber-500/20' },
  { id: 'squats',  name: 'Squats',   bg: 'bg-blue-500',    ring: 'ring-blue-500/30',    text: 'text-blue-400',    border: 'border-blue-500/20' },
];

const MESSAGES = [
  "Get off the couch. Now.",
  "Your muscles are waiting. Don't keep them waiting.",
  "You said you'd work out today. Clock's ticking.",
  "No excuses. Just reps.",
  "Every rep counts. Go do them.",
  "Your future self will thank you. Or not. Your call.",
  "Time to sweat. You know what to do.",
  "The only bad workout is the one that didn't happen.",
];

const BATCH_SIZE = 10;
let reminderTimer = null;
let state = loadState();

function loadState() {
  const today = new Date().toDateString();
  const s = JSON.parse(localStorage.getItem('sassifit') || '{}');
  if (s.date !== today) {
    return { date: today, goal: s.goal || 100, reminderMins: s.reminderMins || 60, reps: { pushups: 0, situps: 0, pullups: 0, squats: 0 } };
  }
  return s;
}

function save() { localStorage.setItem('sassifit', JSON.stringify(state)); }

function addReps(id, n) {
  state.reps[id] = Math.max(0, state.reps[id] + n);
  save(); renderCard(id); updateTopBar();
}

function resetAll() {
  EXERCISES.forEach(e => state.reps[e.id] = 0);
  save(); render();
}

function updateTopBar() {
  const total = EXERCISES.reduce((s, e) => s + state.reps[e.id], 0);
  document.getElementById('topBar').style.width = Math.min(100, (total / (EXERCISES.length * state.goal)) * 100) + '%';
}

function renderCard(id) {
  const ex = EXERCISES.find(e => e.id === id);
  const reps = state.reps[id];
  const pct = Math.min(100, (reps / state.goal) * 100);
  const batches = Math.ceil(state.goal / BATCH_SIZE);
  const full = Math.floor(reps / BATCH_SIZE);
  const partial = reps % BATCH_SIZE;
  const card = document.getElementById('card-' + id);
  if (!card) return;
  card.querySelector('.rep-count').textContent = reps;
  card.querySelector('.rep-goal').textContent = '/ ' + state.goal;
  card.querySelector('.prog-bar').style.width = pct + '%';
  const row = card.querySelector('.batch-row');
  row.innerHTML = '';
  for (let i = 0; i < batches; i++) {
    const b = document.createElement('div');
    b.className = 'batch';
    if (i < full) b.classList.add(ex.bg);
    else if (i === full && partial > 0) { b.classList.add(ex.bg); b.style.opacity = (partial / BATCH_SIZE).toFixed(2); }
    else b.classList.add('bg-zinc-700');
    row.appendChild(b);
  }
}

function render() {
  document.getElementById('dateLabel').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const container = document.getElementById('cards');
  container.innerHTML = '';
  EXERCISES.forEach(ex => {
    const card = document.createElement('div');
    card.id = 'card-' + ex.id;
    card.className = `rounded-2xl bg-zinc-900 border ${ex.border} p-5 ring-1 ${ex.ring}`;
    card.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <span class="font-semibold text-zinc-100 text-base">${ex.name}</span>
        <div class="flex items-baseline gap-1">
          <span class="rep-count text-2xl font-bold ${ex.text}">0</span>
          <span class="rep-goal text-zinc-500 text-sm">/ ${state.goal}</span>
        </div>
      </div>
      <div class="batch-row flex gap-1 flex-wrap mb-3"></div>
      <div class="h-1.5 bg-zinc-800 rounded-full mb-4 overflow-hidden">
        <div class="prog-bar h-1.5 ${ex.bg} rounded-full progress-bar" style="width:0%"></div>
      </div>
      <div class="flex gap-2">
        <button onclick="addReps('${ex.id}',1)"  class="btn-press flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors">+1</button>
        <button onclick="addReps('${ex.id}',5)"  class="btn-press flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors">+5</button>
        <button onclick="addReps('${ex.id}',10)" class="btn-press flex-1 py-2.5 rounded-xl ${ex.bg} text-white text-sm font-bold hover:opacity-90 transition-opacity">+10</button>
        <button onclick="addReps('${ex.id}',-1)" class="btn-press px-3 py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-sm hover:bg-zinc-700 transition-colors">−</button>
      </div>`;
    container.appendChild(card);
    renderCard(ex.id);
  });
  updateTopBar();
}

function openStats() {
  const content = document.getElementById('statsContent');
  content.innerHTML = '';
  EXERCISES.forEach(ex => {
    const reps = state.reps[ex.id];
    const pct = Math.min(100, Math.round((reps / state.goal) * 100));
    content.innerHTML += `
      <div class="flex items-center justify-between">
        <span class="text-zinc-300 text-sm">${ex.name}</span>
        <div class="flex items-center gap-3">
          <div class="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-1.5 ${ex.bg} rounded-full" style="width:${pct}%"></div>
          </div>
          <span class="${ex.text} text-sm font-semibold w-8 text-right">${reps}</span>
        </div>
      </div>`;
  });
  document.getElementById('statsModal').classList.remove('hidden');
}
function closeStats() { document.getElementById('statsModal').classList.add('hidden'); }

function openSettings() {
  document.getElementById('goalInput').value = state.goal;
  document.getElementById('intervalInput').value = state.reminderMins;
  document.getElementById('intervalStatus').textContent = `Currently every ${state.reminderMins} min`;
  updateNotifBtn();
  document.getElementById('settingsModal').classList.remove('hidden');
}
function closeSettings() { document.getElementById('settingsModal').classList.add('hidden'); }

function saveGoal() {
  const v = parseInt(document.getElementById('goalInput').value);
  if (v > 0) { state.goal = v; save(); render(); closeSettings(); }
}

function saveInterval() {
  const v = parseInt(document.getElementById('intervalInput').value);
  if (!v || v < 1) return;
  state.reminderMins = v;
  save();
  startReminders();
  if (window.updateInterval) window.updateInterval(v);
  document.getElementById('intervalStatus').textContent = `Reminder set every ${v} min`;
}

function startReminders() {
  if (reminderTimer) clearInterval(reminderTimer);
  reminderTimer = setInterval(() => {
    if (Notification.permission !== 'granted') return;
    const total = EXERCISES.reduce((s, e) => s + state.reps[e.id], 0);
    if (total < EXERCISES.length * state.goal) {
      new Notification('SassiFit', { body: MESSAGES[Math.floor(Math.random() * MESSAGES.length)] });
    }
  }, state.reminderMins * 60000);
}

function updateNotifBtn() {
  const btn = document.getElementById('notifBtn');
  btn.className = 'btn-press w-full py-3 rounded-xl bg-zinc-800 text-sm font-medium hover:bg-zinc-700 transition-colors';
  if (Notification.permission === 'granted') {
    btn.textContent = '✓ Notifications Enabled';
    btn.classList.add('text-emerald-400');
  } else if (Notification.permission === 'denied') {
    btn.textContent = 'Blocked — Enable in Phone Settings';
    btn.classList.add('text-rose-400');
  } else {
    btn.textContent = 'Enable Notifications';
    btn.classList.add('text-zinc-300');
  }
}

async function requestNotifications() {
  if (!('Notification' in window)) { alert('Notifications not supported on this browser.'); return; }
  const token = await window.registerPush();
  if (token) startReminders();
  updateNotifBtn();
}

render();
updateNotifBtn();
startReminders();
