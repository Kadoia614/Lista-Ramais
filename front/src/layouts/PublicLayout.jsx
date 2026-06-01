import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function PublicLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="app-shell public-shell">
      <header className="topbar public-topbar">
        <div className="max-w-3xl">
          <span className="eyebrow">Consulta pública</span>
          <h1 className="mt-3">Lista de Ramais</h1>
          <p className="mt-2 max-w-2xl">
            Encontre rapidamente pessoas, setores e extensões disponíveis para atendimento.
          </p>
        </div>
        <nav className="topbar-actions">
          <Link to="/public" className="ghost-link">
            Ramais públicos
          </Link>
          <Link to={isAuthenticated ? '/admin/users' : '/login'} className="ghost-link">
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </Link>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
