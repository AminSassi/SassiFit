import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Plus, Trash2, LogOut, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/UI';
import {
  requestNotificationPermission,
  getPermissionStatus,
  scheduleWorkoutReminders,
  testNotification,
  isNotificationSupported,
} from '../notifications';

const GOALS = ['Build Muscle', 'Lose Fat', 'Improve Endurance', 'Stay Active'];

export default function ProfileScreen() {
  const { user, setUser, reminderTimes, setReminderTimes } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [permission, setPermission] = useState(getPermissionStatus());
  const [newTime, setNewTime] = useState('08:00');

  useEffect(() => {
    if (permission === 'granted') scheduleWorkoutReminders(reminderTimes);
  }, [reminderTimes, permission]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) scheduleWorkoutReminders(reminderTimes);
  };

  const addTime = () => {
    if (reminderTimes.includes(newTime)) return;
    setReminderTimes([...reminderTimes, newTime].sort());
  };

  const removeTime = (t) => setReminderTimes(reminderTimes.filter(x => x !== t));

  const handleSave = () => setUser(prev => ({ ...prev, name: name.trim() || prev.name }));

  return (
    <div style={{ padding: 16, paddingBottom: 80, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Profile</h2>

      {/* Avatar */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--accent)33', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>{user.name[0]?.toUpperCase()}</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{user.name}</div>
        <div style={{ fontSize: 13, color: 'var(--accent-light)', marginTop: 2 }}>{user.goal}</div>
      </div>

      {/* Edit Name */}
      <Card>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>Display Name</div>
        <input
          style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 15, marginBottom: 8 }}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <button onClick={handleSave} style={{ width: '100%', padding: 10, borderRadius: 10, background: 'var(--accent)', color: '#fff', fontWeight: 700 }}>Save</button>
      </Card>

      {/* Goal */}
      <Card>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>Fitness Goal</div>
        {GOALS.map(g => (
          <button key={g} onClick={() => setUser(prev => ({ ...prev, goal: g }))}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', background: 'none', color: user.goal === g ? 'var(--text)' : 'var(--muted)', fontWeight: user.goal === g ? 600 : 400, fontSize: 14 }}>
            {g}
            {user.goal === g && <CheckCircle size={18} color="var(--accent)" />}
          </button>
        ))}
      </Card>

      {/* Notifications */}
      <Card>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>🔔 Workout Reminders</div>

        {!isNotificationSupported() && (
          <div style={{ fontSize: 13, color: 'var(--red)' }}>Notifications not supported on this browser.</div>
        )}

        {isNotificationSupported() && permission !== 'granted' && (
          <button onClick={handleEnableNotifications} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Bell size={18} /> Enable Notifications
          </button>
        )}

        {permission === 'denied' && (
          <div style={{ fontSize: 13, color: 'var(--red)', marginBottom: 8 }}>⚠️ Notifications blocked. Enable them in Safari Settings → SassiFit.</div>
        )}

        {permission === 'granted' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Bell size={16} color="var(--green)" />
              <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Notifications enabled</span>
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Reminder Times</div>
            {reminderTimes.map(t => (
              <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{t}</span>
                <button onClick={() => removeTime(t)} style={{ color: 'var(--red)' }}><Trash2 size={16} /></button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 15 }} />
              <button onClick={addTime} style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--accent)', color: '#fff' }}>
                <Plus size={18} />
              </button>
            </div>

            <button onClick={testNotification} style={{ width: '100%', marginTop: 12, padding: 10, borderRadius: 10, border: '1px solid var(--accent)', color: 'var(--accent)', fontWeight: 600, fontSize: 13 }}>
              🧪 Test Notification Now
            </button>
          </>
        )}
      </Card>

      {/* Sign Out */}
      <button onClick={() => navigate('/')} style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--red)44', color: 'var(--red)', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}
