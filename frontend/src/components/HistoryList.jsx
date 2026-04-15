import {
  formatDate,
  formatDiffReps,
  formatDiffWeight,
  statusClass,
  statusLabel
} from '../services/formatters';

export default function HistoryList({ entries, onEdit, onDelete, deletingEntryId }) {
  return (
    <section className="card">
      <h2>Historico</h2>

      {entries.length === 0 ? (
        <p className="muted">Nenhum registro ainda.</p>
      ) : (
        <div className="stack-md">
          {entries.map((entry) => (
            <article className="history-item" key={entry._id}>
              <header className="history-header">
                <strong>{formatDate(entry.performedAt)}</strong>
                <div className="action-row-tight">
                  <button type="button" className="btn btn-secondary btn-inline" onClick={() => onEdit(entry)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-inline"
                    onClick={() => onDelete(entry)}
                    disabled={deletingEntryId === entry._id}
                  >
                    {deletingEntryId === entry._id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </header>

              <div className="stack-sm">
                {entry.exercises.map((exercise) => (
                  <div className="exercise-history" key={`${entry._id}-${exercise.name}`}>
                    <div className="exercise-title-row">
                      <span>{exercise.name}</span>
                      <span className={`badge ${statusClass(exercise.comparison.status)}`}>
                        {statusLabel(exercise.comparison.status)}
                      </span>
                    </div>

                    <div className="diff-row">
                      <span
                        className={exercise.comparison.diffWeightKg >= 0 ? 'diff-positive' : 'diff-negative'}
                      >
                        {formatDiffWeight(exercise.comparison.diffWeightKg)}
                      </span>
                      <span className={exercise.comparison.diffReps >= 0 ? 'diff-positive' : 'diff-negative'}>
                        {formatDiffReps(exercise.comparison.diffReps)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
