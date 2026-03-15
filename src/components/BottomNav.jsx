import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Apple, BarChart2, User } from 'lucide-react';

const TABS = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/workout', icon: Dumbbell, label: 'Workout' },
  { path: '/nutrition', icon: Apple, label: 'Nutrition' },
  { path: '/progress', icon: BarChart2, label: 'Progress' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--card)', borderTop: '1px solid var(--border)',
      display: 'flex', height: 60,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <button key={path} onClick={() => navigate(path)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, color: active ? 'var(--accent)' : 'var(--muted)' }}>
            <Icon size={22} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
