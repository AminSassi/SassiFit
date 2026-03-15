import { useState } from 'react';
import { CheckCircle, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/UI';

const EXERCISES = ['Bench Press','Squat','Deadlift','Pull-Up','Shoulder Press','Bicep Curl','Tricep Dip','Leg Press','Lat Pulldown','Row'];

export default function WorkoutScreen() {
  const { logWorkout } = useApp();
  const [selected, setSelected] = useState('Bench Press');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('60');
  const [logged, setLogged] = useState([]);

  const handleLog = () => {
    const entry = { name: selected, sets: +sets || 0, reps: +reps || 0, weight: +weight || 0, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    logWorkout(entry);
    setLogged(p => [entry, ...p]);
  };

  const inputStyle = { width: '100%', padding: '10px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 20, fontWeight: 700, textAlign: 'center' };

  return (
    <div style={{ padding: 16, paddingBottom: 80, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Log Workout</h2>

      <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>Exercise</div>
      <div className="no-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {EXERCISES.map(ex => (
          <button key={ex} onClick={() => setSelected(ex)} style={{
            whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            border: `1px solid ${selected === ex ? 'var(--accent)' : 'var(--border)'}`,
            background: selected === ex ? '#2e1065' : 'var(--card)',
            color: selected === ex ? 'var(--accent-light)' : 'var(--muted)',
          }}>{ex}</button>
        ))}
      </div>

      <Card>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{selected}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[['Sets', sets, setSets], ['Reps', reps, setReps], ['kg', weight, setWeight]].map(([lbl, val, set]) => (
            <div key={lbl}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textAlign: 'center' }}>{lbl}</div>
              <input style={inputStyle} value={val} onChange={e => set(e.target.value)} type="number" />
            </div>
          ))}
        </div>
        <button onClick={handleLog} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <PlusCircle size={20} /> Log Set
        </button>
      </Card>

      {logged.length > 0 && (
        <>
          <div style={{ fontSize: 16, fontWeight: 700, margin: '12px 0 8px' }}>Today's Session</div>
          {logged.map((w, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={18} color="var(--green)" />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{w.name}</span>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>{w.sets}×{w.reps} @ {w.weight}kg</span>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
