import { Link, Outlet } from 'react-router-dom';

export function PublicLayout() {
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
          <Link to="/login" className="ghost-link">
            Login
          </Link>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
