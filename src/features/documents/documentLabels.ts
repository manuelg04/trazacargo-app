export type DocumentDirection = 'COMPANY_TO_DRIVER' | 'DRIVER_TO_COMPANY';

export type DocumentStatus = 'PENDING' | 'AVAILABLE' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export type DocumentRequirementStatus = 'PENDING' | 'IN_REVIEW' | 'SATISFIED' | 'REJECTED' | 'WAIVED';

export type DocumentType =
  | 'MANIFEST'
  | 'REMITTANCE'
  | 'ADVANCE'
  | 'LOADING_ORDER'
  | 'DELIVERY_TICKET'
  | 'PAYMENT_ACCOUNT'
  | 'SUPPORT_PHOTO'
  | 'FULFILLMENT'
  | 'OTHER';

export type UploadedByType = 'COMPANY' | 'DRIVER' | 'DISPATCHER' | 'ADMIN';

export const documentDirectionLabels: Record<DocumentDirection, string> = {
  COMPANY_TO_DRIVER: 'Empresa → conductor',
  DRIVER_TO_COMPANY: 'Conductor → empresa',
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  PENDING: 'Pendiente',
  AVAILABLE: 'Disponible',
  SUBMITTED: 'En revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  ARCHIVED: 'Archivado',
};

export const documentRequirementStatusLabels: Record<DocumentRequirementStatus, string> = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  SATISFIED: 'Cumplido',
  REJECTED: 'Rechazado',
  WAIVED: 'No aplica',
};

export const documentTypeLabels: Record<DocumentType, string> = {
  MANIFEST: 'Manifiesto',
  REMITTANCE: 'Remesa',
  ADVANCE: 'Anticipo',
  LOADING_ORDER: 'Orden de cargue',
  DELIVERY_TICKET: 'Ticket de descargue',
  PAYMENT_ACCOUNT: 'Cuenta de cobro',
  SUPPORT_PHOTO: 'Foto soporte',
  FULFILLMENT: 'Cumplido',
  OTHER: 'Otro',
};

export const companyDocumentTypeOptions = [
  { value: 'MANIFEST', label: documentTypeLabels.MANIFEST },
  { value: 'REMITTANCE', label: documentTypeLabels.REMITTANCE },
  { value: 'ADVANCE', label: documentTypeLabels.ADVANCE },
  { value: 'LOADING_ORDER', label: documentTypeLabels.LOADING_ORDER },
  { value: 'OTHER', label: documentTypeLabels.OTHER },
] satisfies { value: DocumentType; label: string }[];

export const driverDocumentTypeOptions = [
  { value: 'DELIVERY_TICKET', label: documentTypeLabels.DELIVERY_TICKET },
  { value: 'PAYMENT_ACCOUNT', label: documentTypeLabels.PAYMENT_ACCOUNT },
  { value: 'SUPPORT_PHOTO', label: documentTypeLabels.SUPPORT_PHOTO },
  { value: 'FULFILLMENT', label: documentTypeLabels.FULFILLMENT },
  { value: 'OTHER', label: documentTypeLabels.OTHER },
] satisfies { value: DocumentType; label: string }[];

export function getDocumentTypeLabel(documentType: string) {
  return documentTypeLabels[documentType as DocumentType] ?? documentType;
}
