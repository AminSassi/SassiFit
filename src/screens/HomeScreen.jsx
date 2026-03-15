import { useNavigate } from 'react-router-dom';
import { Flame, Dumbbell, Apple, BarChart2, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, StatBox } from '../components/UI';

const ACTIONS = [
  { icon: Dumbbell, label: 'Log Workout', path: '/workout', color: 'var(--accent)' },
  { icon: Apple, label: 'Log Meal', path: '/nutrition', color: 'var(--green)' },
  { icon: BarChart2, label: 'Progress', path: '/progress', color: 'var(--orange)' },
  { icon: User, label: 'Profile', path: '/profile', color: 'var(--blue)' },
];

export default function HomeScreen() {
  const { user, workouts, nutrition } = useApp();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 16, paddingBottom: 80, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a0533,var(--bg))', borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Good day,</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{user.name} 👋</div>
          <div style={{ fontSize: 13, color: 'var(--accent-light)', marginTop: 2 }}>{user.goal}</div>
        </div>
        <div style={{ textAlign: 'center', background: 'var(--card)', borderRadius: 12, padding: '8px 12px', border: '1px solid var(--border)' }}>
          <Flame size={20} color="var(--orange)" />
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--orange)' }}>{user.streak}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>day streak</div>
        </div>
      </div>

      {/* Stats */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Today's Stats</div>
        <div style={{ display: 'flex' }}>
          <StatBox label="Calories" value={Math.round(nutrition.calories)} unit="kcal" color="var(--orange)" />
          <StatBox label="Protein" value={`${Math.round(nutrition.protein)}g`} color="var(--green)" />
          <StatBox label="Workouts" value={workouts.length} unit="done" color="var(--accent)" />
        </div>
      </Card>

      {/* Quick Actions */}
      <div style={{ fontSize: 16, fontWeight: 700, margin: '12px 0 8px' }}>Quick Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {ACTIONS.map(({ icon: Icon, label, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={26} color={color} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Recent Workouts */}
      {workouts.length > 0 && (
        <>
          <div style={{ fontSize: 16, fontWeight: 700, margin: '12px 0 8px' }}>Recent Workouts</div>
          {workouts.slice(0, 3).map((w, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Dumbbell size={18} color="var(--accent)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{w.sets} sets · {w.reps} reps · {w.weight}kg</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{w.time}</div>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
