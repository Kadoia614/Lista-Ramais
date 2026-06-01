import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../api';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { useToast } from '../../toast/ToastContext';

const emptyForm = { nome: '', setor: '', ramal: '' };

export function RamaisPage() {
  const { pushToast } = useToast();
  const [ramais, setRamais] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadRamais = useCallback(async () => {
    setLoading(true);
    try {
      setRamais(await api.listRamais());
    } catch (error) {
      pushToast({ type: 'error', title: 'Erro ao carregar ramais', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRamais();
  }, [loadRamais]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return ramais;
    return ramais.filter((item) => `${item.nome} ${item.setor} ${item.ramal}`.toLowerCase().includes(term));
  }, [search, ramais]);

  function openCreate() {
    setForm(emptyForm);
    setModal({ mode: 'create' });
  }

  function openEdit(item) {
    setForm({ nome: item.nome, setor: item.setor, ramal: item.ramal });
    setModal({ mode: 'edit', item });
  }

  function openDelete(item) {
    setModal({ mode: 'delete', item });
  }

  async function submitForm(event) {
    event.preventDefault();
    try {
      if (modal.mode === 'create') {
        await api.createRamal(form);
        pushToast({ type: 'success', title: 'Ramal criado', description: 'Cadastro salvo com sucesso.' });
      } else {
        await api.updateRamal(modal.item.id, form);
        pushToast({ type: 'success', title: 'Ramal atualizado', description: 'Alterações aplicadas com sucesso.' });
      }
      setModal(null);
      await loadRamais();
    } catch (error) {
      pushToast({ type: 'error', title: 'Falha na operação', description: error.message });
    }
  }

  async function confirmDelete() {
    try {
      await api.deleteRamal(modal.item.id);
      pushToast({ type: 'success', title: 'Ramal excluído', description: modal.item.nome });
      setModal(null);
      await loadRamais();
    } catch (error) {
      pushToast({ type: 'error', title: 'Falha ao excluir', description: error.message });
    }
  }

  const rows = filtered.map((item) => [
    item.nome,
    item.setor,
    item.ramal,
    <div className="row-actions" key={item.id}>
      <button type="button" className="secondary-button" onClick={() => openEdit(item)}>
        Editar
      </button>
      <button type="button" className="danger-button small" onClick={() => openDelete(item)}>
        Excluir
      </button>
    </div>,
  ]);

  return (
    <section className="page-card">
      <div className="page-head">
        <div>
          <h2>Ramais</h2>
          <p>Cadastro e manutenção da lista de ramais.</p>
        </div>
        <div className="page-actions">
          <input
            type="search"
            placeholder="Buscar nome, setor ou ramal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" onClick={openCreate}>
            Novo ramal
          </button>
        </div>
      </div>

      {loading ? <div className="inline-alert">Carregando ramais...</div> : null}
      <DataTable columns={['Nome', 'Setor', 'Ramal', 'Ações']} rows={rows} />

      {modal ? (
        <Modal
          title={modal.mode === 'create' ? 'Novo ramal' : modal.mode === 'edit' ? 'Editar ramal' : 'Excluir ramal'}
          description={modal.mode === 'delete' ? 'Confirme a exclusão lógica deste ramal.' : 'Preencha os dados necessários.'}
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
                <button type="submit" form="ramal-form">
                  Salvar
                </button>
              </>
            )
          }
        >
          {modal.mode !== 'delete' ? (
            <form id="ramal-form" className="stack-form" onSubmit={submitForm}>
              <input
                type="text"
                placeholder="Nome da pessoa"
                value={form.nome}
                onChange={(e) => setForm((current) => ({ ...current, nome: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Setor"
                value={form.setor}
                onChange={(e) => setForm((current) => ({ ...current, setor: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Ramal"
                value={form.ramal}
                onChange={(e) => setForm((current) => ({ ...current, ramal: e.target.value }))}
                required
              />
            </form>
          ) : (
            <p>
              <strong>{modal.item.nome}</strong> - {modal.item.setor} - {modal.item.ramal}
            </p>
          )}
        </Modal>
      ) : null}
    </section>
  );
}
