import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LoginPage } from './pages/LoginPage';
import { ChangePasswordPage } from './pages/admin/ChangePasswordPage';
import { RamaisPage } from './pages/admin/RamaisPage';
import { UsersPage } from './pages/admin/UsersPage';
import { PublicPage } from './pages/PublicPage';
import { ToastProvider } from './toast/ToastContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="boot-screen">Carregando sessão...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="boot-screen">Carregando sessão...</div>;
  }

  return <Navigate to={isAuthenticated ? '/admin/users' : '/public'} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/public" element={<PublicLayout />}>
              <Route index element={<PublicPage />} />
            </Route>
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="ramais" element={<RamaisPage />} />
              <Route path="password" element={<ChangePasswordPage />} />
            </Route>
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
