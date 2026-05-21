export type PushNotificationKind =
  | 'new_trip_available'
  | 'trip_accepted'
  | 'driver_document_uploaded'
  | 'document_reviewed'
  | 'documentation_complete'
  | 'trip_cancelled'
  | 'offer_no_longer_available'
  | 'company_document_available'
  | 'document_due_soon'
  | 'document_overdue';

export type PushNotificationReviewStatus = 'APPROVED' | 'REJECTED';
export type PushNotificationAudience = 'driver' | 'staff';

export type PushNotificationData = {
  type: PushNotificationKind;
  tripId: string;
  documentId?: string;
  requirementId?: string;
  offerId?: string;
};

export type PushNotificationMessage = {
  title: string;
  body: string;
  data: PushNotificationData;
};

export type ExpoPushMessage = PushNotificationMessage & {
  to: string;
};

export type NotificationEventStatus = 'queued' | 'sent' | 'skipped' | 'ticket_error' | 'receipt_error' | 'failed';

export function buildNotificationMessage(input: {
  kind: PushNotificationKind;
  tripId: string;
  documentId?: string;
  requirementId?: string;
  offerId?: string;
  reviewStatus?: PushNotificationReviewStatus;
  notificationAudience?: PushNotificationAudience;
}): PushNotificationMessage {
  const data = removeUndefinedValues({
    type: input.kind,
    tripId: input.tripId,
    documentId: input.documentId,
    requirementId: input.requirementId,
    offerId: input.offerId,
  });

  switch (input.kind) {
    case 'new_trip_available':
      return {
        title: 'Nuevo viaje disponible',
        body: 'Tienes una nueva oferta de viaje para revisar.',
        data,
      };
    case 'trip_accepted':
      return {
        title: 'Viaje aceptado',
        body: 'Un conductor aceptó una oferta de viaje.',
        data,
      };
    case 'driver_document_uploaded':
      return {
        title: 'Documento recibido',
        body: 'Un conductor subió un documento para revisión.',
        data,
      };
    case 'document_reviewed':
      return {
        title: input.reviewStatus === 'APPROVED' ? 'Documento aprobado' : 'Documento rechazado',
        body: input.reviewStatus === 'APPROVED' ? 'Tu documento fue aprobado.' : 'Tu documento necesita corrección.',
        data,
      };
    case 'documentation_complete':
      return {
        title: 'Documentación completa',
        body: 'El viaje ya tiene la documentación obligatoria completa.',
        data,
      };
    case 'trip_cancelled':
      return {
        title: 'Viaje cancelado',
        body: 'La empresa canceló este viaje. Revisa el detalle antes de continuar.',
        data,
      };
    case 'offer_no_longer_available':
      return {
        title: 'Oferta ya no disponible',
        body: 'Otro conductor aceptó este viaje. La oferta ya fue cerrada.',
        data,
      };
    case 'company_document_available':
      return {
        title: 'Documento disponible',
        body: 'La empresa subió un documento para este viaje.',
        data,
      };
    case 'document_due_soon':
      return {
        title: 'Documento pendiente por vencer',
        body: 'Tienes un documento próximo a vencer en este viaje.',
        data,
      };
    case 'document_overdue':
      return input.notificationAudience === 'staff'
        ? {
            title: 'Documento atrasado',
            body: 'Un documento requerido está vencido en un viaje.',
            data,
          }
        : {
            title: 'Documento vencido',
            body: 'Tienes un documento atrasado en este viaje.',
            data,
          };
  }
}

export function buildNotificationEventKey(input: {
  kind: PushNotificationKind;
  offerId?: string;
  tripId?: string;
  driverId?: string;
  documentId?: string;
  requirementId?: string;
  reviewStatus?: PushNotificationReviewStatus;
  deadlineAt?: number;
  notificationAudience?: PushNotificationAudience;
}) {
  switch (input.kind) {
    case 'new_trip_available':
      return `new_trip_available:${requireValue(input.offerId)}`;
    case 'trip_accepted':
      return `trip_accepted:${requireValue(input.tripId)}:${requireValue(input.driverId)}`;
    case 'driver_document_uploaded':
      return `driver_document_uploaded:${requireValue(input.documentId)}`;
    case 'document_reviewed':
      return `document_reviewed:${requireValue(input.documentId)}:${requireValue(input.reviewStatus)}`;
    case 'documentation_complete':
      return `documentation_complete:${requireValue(input.tripId)}`;
    case 'trip_cancelled':
      return `trip_cancelled:${requireValue(input.tripId)}:${requireValue(input.driverId)}`;
    case 'offer_no_longer_available':
      return `offer_no_longer_available:${requireValue(input.offerId)}`;
    case 'company_document_available':
      return `company_document_available:${requireValue(input.documentId)}`;
    case 'document_due_soon':
      return `document_due_soon:${requireValue(input.requirementId)}:${requireNumber(input.deadlineAt)}`;
    case 'document_overdue':
      return `document_overdue:${requireValue(input.notificationAudience)}:${requireValue(input.requirementId)}:${requireNumber(input.deadlineAt)}`;
  }
}

export function chunkPushMessages<T>(messages: T[], size = 100) {
  const chunks: T[][] = [];

  for (let index = 0; index < messages.length; index += size) {
    chunks.push(messages.slice(index, index + size));
  }

  return chunks;
}

export function getExpoPushTokenSuffix(expoPushToken: string) {
  return expoPushToken.slice(-7);
}

export function shouldIgnoreExistingNotificationEvent(event: { status: NotificationEventStatus } | undefined) {
  return event?.status === 'queued' || event?.status === 'sent';
}

function requireValue(value: string | undefined) {
  if (!value) {
    throw new Error('Missing notification event key value');
  }

  return value;
}

function requireNumber(value: number | undefined) {
  if (value === undefined) {
    throw new Error('Missing notification event key value');
  }

  return value;
}

function removeUndefinedValues(data: {
  type: PushNotificationKind;
  tripId: string;
  documentId?: string;
  requirementId?: string;
  offerId?: string;
}) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as PushNotificationData;
}
