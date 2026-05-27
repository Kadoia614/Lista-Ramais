import { Link, Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <main className="app-shell public-shell">
      <header className="topbar public-topbar">
        <div>
          <span className="eyebrow">Consulta pública</span>
          <h1>Lista de Ramais</h1>
          <p>Acesso livre para consulta dos ramais cadastrados.</p>
        </div>
        <nav className="topbar-actions">
          <Link to="/login" className="ghost-link">
            Login
          </Link>
          <Link to="/public" className="ghost-link">
            Ramais públicos
          </Link>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
