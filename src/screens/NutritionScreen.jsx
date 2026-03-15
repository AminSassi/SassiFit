import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, ProgressBar } from '../components/UI';

const FOODS = [
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Brown Rice (100g)', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
  { name: 'Egg (1 large)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Whey Protein (1 scoop)', calories: 120, protein: 25, carbs: 3, fat: 1.5 },
  { name: 'Oats (100g)', calories: 389, protein: 17, carbs: 66, fat: 7 },
  { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Greek Yogurt (150g)', calories: 100, protein: 17, carbs: 6, fat: 0.7 },
];

const GOALS = { calories: 2500, protein: 180, carbs: 250, fat: 70 };

const MACROS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: 'var(--orange)' },
  { key: 'protein', label: 'Protein', unit: 'g', color: 'var(--green)' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: 'var(--blue)' },
  { key: 'fat', label: 'Fat', unit: 'g', color: 'var(--red)' },
];

export default function NutritionScreen() {
  const { nutrition, logMeal, resetNutrition } = useApp();
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState(null);

  const filtered = FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (food) => {
    logMeal(food);
    setAdded(food.name);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 80, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Nutrition</h2>
        <button onClick={resetNutrition} style={{ fontSize: 13, color: 'var(--red)' }}>Reset Day</button>
      </div>

      {added && <div style={{ background: '#14532d', border: '1px solid var(--green)', borderRadius: 10, padding: '8px 14px', marginBottom: 10, fontSize: 13, color: 'var(--green)' }}>✅ {added} logged!</div>}

      <Card>
        {MACROS.map(m => (
          <div key={m.key} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{m.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>
                {Math.round(nutrition[m.key])}<span style={{ color: 'var(--muted)', fontWeight: 400 }}>/{GOALS[m.key]}{m.unit}</span>
              </span>
            </div>
            <ProgressBar value={nutrition[m.key]} max={GOALS[m.key]} color={m.color} />
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 14px', marginBottom: 8 }}>
        <span style={{ color: 'var(--muted)' }}>🔍</span>
        <input style={{ flex: 1, background: 'none', color: 'var(--text)', fontSize: 14, border: 'none' }} placeholder="Search foods..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.map((food, i) => (
        <Card key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{food.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{food.calories} kcal · P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g</div>
            </div>
            <button onClick={() => handleAdd(food)} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} color="var(--accent)" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
