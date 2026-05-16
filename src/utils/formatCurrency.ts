const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCurrency(value?: number) {
  if (value === undefined) {
    return 'No informado';
  }

  return currencyFormatter.format(value);
}
