export function sanitizeMoneyInput(value: string) {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  return digits.replace(/^0+(?=\d)/, '');
}

export function formatMoneyInput(value: string) {
  const sanitizedValue = sanitizeMoneyInput(value);

  if (!sanitizedValue) {
    return '';
  }

  return sanitizedValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseMoneyInputToNumber(value: string) {
  const sanitizedValue = sanitizeMoneyInput(value);

  if (!sanitizedValue) {
    return undefined;
  }

  const numberValue = Number(sanitizedValue);

  if (!Number.isFinite(numberValue)) {
    return undefined;
  }

  return numberValue;
}

export function formatCurrencyDisplay(value?: number) {
  if (value === undefined) {
    return 'No informado';
  }

  return `$ ${formatMoneyInput(String(Math.trunc(value)))}`;
}
