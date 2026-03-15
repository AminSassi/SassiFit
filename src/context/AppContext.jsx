import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export function AppProvider({ children }) {
  const [user, setUserState] = useState(() => load('user', { name: '', goal: 'Build Muscle', streak: 0 }));
  const [workouts, setWorkouts] = useState(() => load('workouts', []));
  const [nutrition, setNutrition] = useState(() => load('nutrition', { calories: 0, protein: 0, carbs: 0, fat: 0 }));
  const [reminderTimes, setReminderTimesState] = useState(() => load('reminderTimes', ['08:00', '18:00']));

  const setUser = (val) => {
    const next = typeof val === 'function' ? val(user) : val;
    setUserState(next);
    localStorage.setItem('user', JSON.stringify(next));
  };

  const logWorkout = (w) => {
    const next = [w, ...workouts];
    setWorkouts(next);
    localStorage.setItem('workouts', JSON.stringify(next));
    setUser(prev => ({ ...prev, streak: (prev.streak || 0) + 1 }));
  };

  const logMeal = (meal) => {
    const next = {
      calories: nutrition.calories + meal.calories,
      protein: nutrition.protein + meal.protein,
      carbs: nutrition.carbs + meal.carbs,
      fat: nutrition.fat + meal.fat,
    };
    setNutrition(next);
    localStorage.setItem('nutrition', JSON.stringify(next));
  };

  const resetNutrition = () => {
    const zero = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    setNutrition(zero);
    localStorage.setItem('nutrition', JSON.stringify(zero));
  };

  const setReminderTimes = (times) => {
    setReminderTimesState(times);
    localStorage.setItem('reminderTimes', JSON.stringify(times));
  };

  return (
    <AppContext.Provider value={{ user, setUser, workouts, logWorkout, nutrition, logMeal, resetNutrition, reminderTimes, setReminderTimes }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
