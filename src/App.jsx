import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import NutritionScreen from './screens/NutritionScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {children}
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  const { user } = useApp();
  const isLoggedIn = !!user.name;

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <LoginScreen />} />
      <Route path="/home" element={<Layout><HomeScreen /></Layout>} />
      <Route path="/workout" element={<Layout><WorkoutScreen /></Layout>} />
      <Route path="/nutrition" element={<Layout><NutritionScreen /></Layout>} />
      <Route path="/progress" element={<Layout><ProgressScreen /></Layout>} />
      <Route path="/profile" element={<Layout><ProfileScreen /></Layout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
