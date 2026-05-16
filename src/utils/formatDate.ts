const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDate(value?: number) {
  if (value === undefined) {
    return 'No definido';
  }

  return dateFormatter.format(new Date(value));
}
