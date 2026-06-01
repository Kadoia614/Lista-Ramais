import { useEffect, useState } from 'react';
import { api } from '../api';
import { Pagination } from '../components/Pagination';

const perPage = 10;

export function PublicPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');

    api
      .publicRamais({ page, perPage, search })
      .then((result) => {
        setItems(result.data);
        setPagination(result.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search]);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  return (
    <section className="page-card">
      <div className="page-head">
        <div>
          <span className="eyebrow">Diretório</span>
          <h2 className="mt-3">Consulta pública</h2>
          <p>Visualização liberada, sem acesso ao painel administrativo.</p>
        </div>
        <div className="page-actions">
          <input
            type="search"
            placeholder="Buscar nome, setor ou ramal"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-bold uppercase text-emerald-800">Ramais cadastrados</p>
          <strong className="text-2xl text-emerald-950">{pagination?.total ?? 0}</strong>
        </div>
        <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3">
          <p className="text-xs font-bold uppercase text-sky-800">Nesta página</p>
          <strong className="text-2xl text-sky-950">{items.length}</strong>
        </div>
      </div>

      {error ? <div className="inline-alert error">{error}</div> : null}
      {loading ? <div className="inline-alert">Carregando ramais...</div> : null}

      <div className="public-grid">
        {items.map((item) => (
          <article key={item.ramal} className="public-row-card">
            <strong>{item.nome}</strong>
            <span>{item.setor}</span>
            <small>{item.ramal}</small>
          </article>
        ))}
        {!loading && items.length === 0 ? <div className="inline-alert">Nenhum ramal encontrado.</div> : null}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />
    </section>
  );
}
