import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

export function PublicPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .publicRamais()
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => `${item.nome} ${item.setor} ${item.ramal}`.toLowerCase().includes(term));
  }, [items, search]);

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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-bold uppercase text-emerald-800">Ramais cadastrados</p>
          <strong className="text-2xl text-emerald-950">{items.length}</strong>
        </div>
        <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3">
          <p className="text-xs font-bold uppercase text-sky-800">Resultados exibidos</p>
          <strong className="text-2xl text-sky-950">{filtered.length}</strong>
        </div>
      </div>

      {error ? <div className="inline-alert error">{error}</div> : null}
      {loading ? <div className="inline-alert">Carregando ramais...</div> : null}

      <div className="public-grid">
        {filtered.map((item) => (
          <article key={item.ramal} className="public-row-card">
            <strong>{item.nome}</strong>
            <span>{item.setor}</span>
            <small>{item.ramal}</small>
          </article>
        ))}
        {!loading && filtered.length === 0 ? <div className="inline-alert">Nenhum ramal encontrado.</div> : null}
      </div>
    </section>
  );
}
