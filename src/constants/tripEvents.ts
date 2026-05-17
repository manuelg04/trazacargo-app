export const tripEventLabels = {
  TRIP_ACCEPTED: 'Viaje aceptado',
  ARRIVED_TO_LOADING: 'Llegada a cargue',
  LOADED: 'Cargado',
  STARTED_ROUTE: 'Ruta iniciada',
  ARRIVED_TO_UNLOADING: 'Llegada a descargue',
  UNLOADED: 'Descargado',
  DOCUMENTS_SUBMITTED: 'Documentos enviados',
  TRIP_CLOSED: 'Viaje cerrado',
  ISSUE_REPORTED: 'Novedad reportada',
} as const;

export const operationalEventActions = [
  { eventType: 'ARRIVED_TO_LOADING', label: 'Llegué a cargue' },
  { eventType: 'LOADED', label: 'Cargado' },
  { eventType: 'STARTED_ROUTE', label: 'Iniciar ruta' },
  { eventType: 'ARRIVED_TO_UNLOADING', label: 'Llegué a descargue' },
  { eventType: 'UNLOADED', label: 'Descargado' },
] as const;

export type TripEventType = keyof typeof tripEventLabels;
export type OperationalEventType = (typeof operationalEventActions)[number]['eventType'];
