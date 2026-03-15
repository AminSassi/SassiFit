import { Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, StatBox } from '../components/UI';

export default function ProgressScreen() {
  const { workouts, nutrition } = useApp();
  const totalVolume = workouts.reduce((s, w) => s + w.sets * w.reps * w.weight, 0);
  const avgWeight = workouts.length ? (workouts.reduce((s, w) => s + w.weight, 0) / workouts.length).toFixed(1) : 0;

  return (
    <div style={{ padding: 16, paddingBottom: 80, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Progress</h2>

      <Card>
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>Workout Summary</div>
        <div style={{ display: 'flex' }}>
          <StatBox label="Sessions" value={workouts.length} color="var(--accent)" />
          <StatBox label="Volume" value={`${(totalVolume / 1000).toFixed(1)}t`} color="var(--orange)" />
          <StatBox label="Avg Weight" value={`${avgWeight}kg`} color="var(--green)" />
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>Today's Nutrition</div>
        <div style={{ display: 'flex' }}>
          <StatBox label="Calories" value={Math.round(nutrition.calories)} unit="kcal" color="var(--orange)" />
          <StatBox label="Protein" value={`${Math.round(nutrition.protein)}g`} color="var(--green)" />
          <StatBox label="Carbs" value={`${Math.round(nutrition.carbs)}g`} color="var(--blue)" />
        </div>
      </Card>

      {workouts.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 48, color: 'var(--muted)' }}>
          <Dumbbell size={48} color="var(--border)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 600 }}>No workouts logged yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Start logging to see your progress!</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 16, fontWeight: 700, margin: '12px 0 8px' }}>Workout History</div>
          {workouts.map((w, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', flexShrink: 0 }} />
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
