export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, total, perPage } = pagination;
  const firstItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const lastItem = Math.min(page * perPage, total);

  return (
    <div className="pagination-bar">
      <span>
        {firstItem}-{lastItem} de {total}
      </span>
      <div className="pagination-actions">
        <button type="button" className="secondary-button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          className="secondary-button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
