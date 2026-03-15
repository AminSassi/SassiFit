import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState({ name: 'Athlete', goal: 'Build Muscle', streak: 7 });
  const [workouts, setWorkouts] = useState([]);
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const logWorkout = (workout) => setWorkouts(prev => [workout, ...prev]);
  const logMeal = (meal) => setNutrition(prev => ({
    calories: prev.calories + meal.calories,
    protein: prev.protein + meal.protein,
    carbs: prev.carbs + meal.carbs,
    fat: prev.fat + meal.fat,
  }));
  const resetNutrition = () => setNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <AppContext.Provider value={{ user, setUser, workouts, logWorkout, nutrition, logMeal, resetNutrition }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
