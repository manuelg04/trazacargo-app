export const tripStatusLabels = {
  DRAFT: 'Borrador',
  OFFERED: 'Ofertado',
  ACCEPTED: 'Aceptado',
  IN_LOADING: 'En cargue',
  LOADED: 'Cargado',
  IN_TRANSIT: 'En ruta',
  IN_UNLOADING: 'En descargue',
  UNLOADED: 'Descargado',
  DOCUMENTS_PENDING: 'Documentos pendientes',
  DOCUMENTS_SUBMITTED: 'Documentos enviados',
  DOCUMENTS_APPROVED: 'Documentos aprobados',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
} as const;

export const offerStatusLabels = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  EXPIRED: 'Vencida',
  CANCELLED: 'Cancelada',
} as const;

export const documentStatusLabels = {
  PENDING: 'Pendiente',
  AVAILABLE: 'Disponible',
  SUBMITTED: 'Enviado',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
} as const;

export const documentTypeLabels = {
  MANIFEST: 'Manifiesto',
  REMITTANCE: 'Remesa',
  ADVANCE: 'Anticipo',
  LOADING_ORDER: 'Orden de cargue',
  DELIVERY_TICKET: 'Cumplido',
  PAYMENT_ACCOUNT: 'Cuenta de cobro',
  SUPPORT_PHOTO: 'Foto soporte',
  OTHER: 'Otro',
} as const;

export type TripStatus = keyof typeof tripStatusLabels;
export type OfferStatus = keyof typeof offerStatusLabels;
export type DocumentStatus = keyof typeof documentStatusLabels;
export type DocumentType = keyof typeof documentTypeLabels;
