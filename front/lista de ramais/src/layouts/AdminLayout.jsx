import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <main className="app-shell admin-shell">
      <aside className="sidebar">
        <div>
          <span className="eyebrow">Painel administrativo</span>
          <h1>Ramais</h1>
          <p>{user?.email}</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Usuários
          </NavLink>
          <NavLink to="/admin/ramais" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Ramais
          </NavLink>
          <NavLink
            to="/admin/password"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Alterar senha
          </NavLink>
          <NavLink to="/public" className="nav-item">
            Consulta pública
          </NavLink>
        </nav>

        <button type="button" className="danger-button" onClick={logout}>
          Sair
        </button>
      </aside>

      <section className="content-panel">
        <Outlet />
      </section>
    </main>
  );
}
