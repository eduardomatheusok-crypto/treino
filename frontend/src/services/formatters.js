export function formatDiffWeight(value) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value}kg`;
}

export function formatDiffReps(value) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value} rep`;
}

export function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function statusLabel(status) {
  switch (status) {
    case 'progresso':
      return 'Progresso';
    case 'regressao':
      return 'Regressao';
    case 'parcial_carga':
      return 'Parcial: carga';
    case 'parcial_repeticoes':
      return 'Parcial: repeticoes';
    case 'regressao_total':
      return 'Regressao total';
    default:
      return 'Estavel';
  }
}

export function statusClass(status) {
  if (status === 'progresso' || status === 'parcial_carga' || status === 'parcial_repeticoes') {
    return 'badge-success';
  }

  if (status === 'regressao' || status === 'regressao_total') {
    return 'badge-danger';
  }

  return 'badge-neutral';
}