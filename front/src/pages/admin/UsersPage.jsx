import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../toast/ToastContext';

const emptyForm = { email: '', password: '' };
const perPage = 10;

export function UsersPage() {
  const { pushToast } = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.listUsers({ page, perPage, search });
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (error) {
      pushToast({ type: 'error', title: 'Erro ao carregar usuários', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [page, pushToast, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function openCreate() {
    setForm(emptyForm);
    setModal({ mode: 'create' });
  }

  function openEdit(user) {
    setForm({ email: user.email, password: '' });
    setModal({ mode: 'edit', item: user });
  }

  function openDelete(user) {
    setModal({ mode: 'delete', item: user });
  }

  async function unlockUser(user) {
    try {
      await api.unlockUser(user.id);
      pushToast({ type: 'success', title: 'Usuário desbloqueado', description: user.email });
      await loadUsers();
    } catch (error) {
      pushToast({ type: 'error', title: 'Falha ao desbloquear', description: error.message });
    }
  }

  async function submitForm(event) {
    event.preventDefault();
    try {
      if (modal.mode === 'create') {
        await api.createUser(form);
        pushToast({ type: 'success', title: 'Usuário criado', description: 'O novo usuário foi salvo.' });
      } else {
        const payload = { email: form.email };
        if (form.password) payload.password = form.password;
        await api.updateUser(modal.item.id, payload);
        pushToast({ type: 'success', title: 'Usuário atualizado', description: 'Alterações aplicadas com sucesso.' });
      }
      setModal(null);
      await loadUsers();
    } catch (error) {
      pushToast({ type: 'error', title: 'Falha na operação', description: error.message });
    }
  }

  async function confirmDelete() {
    try {
      await api.deleteUser(modal.item.id);
      pushToast({ type: 'success', title: 'Usuário excluído', description: modal.item.email });
      setModal(null);
      await loadUsers();
    } catch (error) {
      pushToast({ type: 'error', title: 'Falha ao excluir', description: error.message });
    }
  }

  const rows = users.map((user) => [
    user.email,
    <span className={user.lockedAt ? 'status-pill locked' : 'status-pill active'} key={`${user.id}-status`}>
      {user.lockedAt ? 'Bloqueado' : 'Ativo'}
    </span>,
    user.failedLoginAttempts,
    formatDate(user.createdAt),
    <div className="row-actions" key={user.id}>
      {user.lockedAt ? (
        <button type="button" className="secondary-button" onClick={() => unlockUser(user)}>
          Desbloquear
        </button>
      ) : null}
      <button type="button" className="secondary-button" onClick={() => openEdit(user)}>
        Editar
      </button>
      <button type="button" className="danger-button small" onClick={() => openDelete(user)}>
        Excluir
      </button>
    </div>,
  ]);

  return (
    <section className="page-card">
      <div className="page-head">
        <div>
          <h2>Usuários</h2>
          <p>Somente admin autenticado pode cadastrar novos usuários.</p>
        </div>
        <div className="page-actions">
          <input type="search" placeholder="Buscar e-mail" value={search} onChange={handleSearchChange} />
          <button type="button" onClick={openCreate}>
            Novo usuário
          </button>
        </div>
      </div>

      {loading ? <div className="inline-alert">Carregando usuários...</div> : null}
      <DataTable columns={['E-mail', 'Status', 'Tentativas', 'Criado em', 'Ações']} rows={rows} />
      <Pagination pagination={pagination} onPageChange={setPage} />

      {modal ? (
        <Modal
          title={modal.mode === 'create' ? 'Novo usuário' : modal.mode === 'edit' ? 'Editar usuário' : 'Excluir usuário'}
          description={modal.mode === 'delete' ? 'Confirme a exclusão lógica deste usuário.' : 'Preencha os dados necessários.'}
          onClose={() => setModal(null)}
          footer={
            modal.mode === 'delete' ? (
              <>
                <button type="button" className="secondary-button" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button type="button" className="danger-button" onClick={confirmDelete}>
                  Excluir
                </button>
              </>
            ) : (
              <>
                <button type="button" className="secondary-button" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button type="submit" form="user-form">
                  Salvar
                </button>
              </>
            )
          }
        >
          {modal.mode !== 'delete' ? (
            <form id="user-form" className="stack-form" onSubmit={submitForm}>
              <input
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder={modal.mode === 'edit' ? 'Nova senha (opcional)' : 'Senha'}
                value={form.password}
                onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                required={modal.mode === 'create'}
              />
            </form>
          ) : (
            <p>
              <strong>{modal.item.email}</strong>
            </p>
          )}
        </Modal>
      ) : null}
    </section>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
