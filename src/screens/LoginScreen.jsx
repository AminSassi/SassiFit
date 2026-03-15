import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const GOALS = ['Build Muscle', 'Lose Fat', 'Improve Endurance', 'Stay Active'];

export default function LoginScreen() {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(GOALS[0]);

  const handleStart = () => {
    if (!name.trim()) return;
    setUser({ name: name.trim(), goal, streak: 0 });
    navigate('/home');
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(180deg,#1a0533 0%,var(--bg) 50%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Zap size={48} color="var(--accent)" />
        <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>SassiFit</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Your AI-powered fitness companion</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Your Name</label>
          <input
            style={{ display: 'block', width: '100%', marginTop: 6, padding: '12px 14px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 16 }}
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Your Goal</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {GOALS.map(g => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  border: `1px solid ${goal === g ? 'var(--accent)' : 'var(--border)'}`,
                  background: goal === g ? '#2e1065' : 'var(--card)',
                  color: goal === g ? 'var(--accent-light)' : 'var(--muted)',
                }}
              >{g}</button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          style={{ marginTop: 8, padding: 16, borderRadius: 14, background: 'linear-gradient(90deg,var(--accent),#7c3aed)', color: '#fff', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          Let's Go <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
