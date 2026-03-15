export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: 16,
      padding: 16,
      border: '1px solid var(--border)',
      marginBottom: 8,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function StatBox({ label, value, unit, color = 'var(--accent)' }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      {unit && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: -2 }}>{unit}</div>}
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

export function ProgressBar({ value, max, color = 'var(--accent)' }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
    </div>
  );
}
