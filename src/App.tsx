import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';

function AppRoutes() {
  const { user, admin, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user && !admin ? <Login /> : <Navigate to={admin ? "/admin" : "/dashboard"} />} />
      <Route path="/register" element={!user && !admin ? <Register /> : <Navigate to={admin ? "/admin" : "/dashboard"} />} />
      <Route path="/admin/login" element={!admin && !user ? <AdminLogin /> : <Navigate to="/admin/login" />} />
      <Route path="/admin" element={admin ? <AdminPanel /> : <Navigate to="/admin/login" />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : admin ? "/admin" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;