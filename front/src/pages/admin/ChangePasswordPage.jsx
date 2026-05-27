import { useState } from 'react';
import { api } from '../../api';
import { useToast } from '../../toast/ToastContext';

export function ChangePasswordPage() {
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await api.changePassword(form);
      setForm({ currentPassword: '', newPassword: '' });
      pushToast({ type: 'success', title: 'Senha atualizada', description: 'Nova senha aplicada com sucesso.' });
    } catch (error) {
      pushToast({ type: 'error', title: 'Falha ao alterar senha', description: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-card narrow-card">
      <div className="page-head">
        <div>
          <h2>Alterar senha</h2>
          <p>Use sua senha atual e informe a nova senha.</p>
        </div>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Senha atual"
          value={form.currentPassword}
          onChange={(e) => setForm((current) => ({ ...current, currentPassword: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Nova senha"
          value={form.newPassword}
          onChange={(e) => setForm((current) => ({ ...current, newPassword: e.target.value }))}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </section>
  );
}
