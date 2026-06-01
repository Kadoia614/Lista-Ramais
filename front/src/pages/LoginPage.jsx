import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../toast/ToastContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setFormError('');

    try {
      await login(form.email, form.password);
      pushToast({ type: 'success', title: 'Login realizado', description: 'Acesso ao painel liberado.' });
      navigate('/admin/users', { replace: true });
    } catch (error) {
      setFormError(error.message);
      pushToast({ type: 'error', title: 'Falha no login', description: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell auth-shell">
      <section className="hero-card auth-card">
        <span className="eyebrow">Autenticação</span>
        <h1 className="mt-3 text-slate-950">Entrar no sistema</h1>
        <p className="mt-2">
          Acesse o painel para cadastrar usuários, atualizar ramais e manter a consulta sempre em dia.
        </p>

        <form className="stack-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {formError ? <p className="form-error">{formError}</p> : null}

        <div className="inline-links">
          <Link to="/public">Ir para consulta pública</Link>
        </div>
      </section>
    </main>
  );
}
