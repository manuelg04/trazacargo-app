import { formatDate } from './formatDate';

export type DueDateState = 'none' | 'upcoming' | 'dueSoon' | 'overdue';

type DueDateResult = {
  label: string;
  state: DueDateState;
};

const dueSoonWindowMs = 48 * 60 * 60 * 1000;

export function formatDueDate(value?: number, now = Date.now()): DueDateResult {
  if (value === undefined) {
    return { label: 'Sin fecha límite', state: 'none' };
  }

  if (value < now) {
    return { label: `${formatDate(value)} · Vencido`, state: 'overdue' };
  }

  if (value - now <= dueSoonWindowMs) {
    return { label: `${formatDate(value)} · Vence pronto`, state: 'dueSoon' };
  }

  return { label: formatDate(value), state: 'upcoming' };
}
