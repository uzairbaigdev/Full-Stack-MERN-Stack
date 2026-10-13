import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard/dashboard.jsx';
import Login from './pages/login/login.jsx';
import Register from './pages/register/register.jsx';
import useAuthStore from './zustand/authStore.js';

function GuestOnlyRoute() {
  const user = useAuthStore((state) => state.user);

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <Routes>
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;
