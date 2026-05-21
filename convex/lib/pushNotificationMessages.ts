export type PushNotificationKind =
  | 'new_trip_available'
  | 'trip_accepted'
  | 'driver_document_uploaded'
  | 'document_reviewed'
  | 'documentation_complete';

export type PushNotificationReviewStatus = 'APPROVED' | 'REJECTED';

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
  }
}

export function buildNotificationEventKey(input: {
  kind: PushNotificationKind;
  offerId?: string;
  tripId?: string;
  driverId?: string;
  documentId?: string;
  reviewStatus?: PushNotificationReviewStatus;
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

function removeUndefinedValues(data: {
  type: PushNotificationKind;
  tripId: string;
  documentId?: string;
  requirementId?: string;
  offerId?: string;
}) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as PushNotificationData;
}
