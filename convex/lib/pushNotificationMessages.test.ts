import { describe, expect, test } from 'vitest';
import {
  buildNotificationMessage,
  buildNotificationEventKey,
  chunkPushMessages,
  getExpoPushTokenSuffix,
  shouldIgnoreExistingNotificationEvent,
} from './pushNotificationMessages';

describe('pushNotificationMessages', () => {
  test('builds safe notification titles, bodies, payloads, and event keys', () => {
    const message = buildNotificationMessage({
      kind: 'document_reviewed',
      tripId: 'trip123',
      documentId: 'doc456',
      requirementId: 'req789',
      reviewStatus: 'REJECTED',
    });

    expect(message).toEqual({
      title: 'Documento rechazado',
      body: 'Tu documento necesita corrección.',
      data: {
        type: 'document_reviewed',
        tripId: 'trip123',
        documentId: 'doc456',
        requirementId: 'req789',
      },
    });
    expect(buildNotificationEventKey({ kind: 'document_reviewed', documentId: 'doc456', reviewStatus: 'REJECTED' })).toBe(
      'document_reviewed:doc456:REJECTED',
    );
  });

  test('builds new phase two notification messages', () => {
    expect(buildNotificationMessage({ kind: 'trip_cancelled', tripId: 'trip123' })).toEqual({
      title: 'Viaje cancelado',
      body: 'La empresa canceló este viaje. Revisa el detalle antes de continuar.',
      data: {
        type: 'trip_cancelled',
        tripId: 'trip123',
      },
    });
    expect(buildNotificationMessage({ kind: 'offer_no_longer_available', tripId: 'trip123', offerId: 'offer456' })).toEqual({
      title: 'Oferta ya no disponible',
      body: 'Otro conductor aceptó este viaje. La oferta ya fue cerrada.',
      data: {
        type: 'offer_no_longer_available',
        tripId: 'trip123',
        offerId: 'offer456',
      },
    });
    expect(buildNotificationMessage({ kind: 'company_document_available', tripId: 'trip123', documentId: 'doc456' })).toEqual({
      title: 'Documento disponible',
      body: 'La empresa subió un documento para este viaje.',
      data: {
        type: 'company_document_available',
        tripId: 'trip123',
        documentId: 'doc456',
      },
    });
    expect(buildNotificationMessage({ kind: 'document_due_soon', tripId: 'trip123', requirementId: 'req789' })).toEqual({
      title: 'Documento pendiente por vencer',
      body: 'Tienes un documento próximo a vencer en este viaje.',
      data: {
        type: 'document_due_soon',
        tripId: 'trip123',
        requirementId: 'req789',
      },
    });
    expect(
      buildNotificationMessage({
        kind: 'document_overdue',
        tripId: 'trip123',
        requirementId: 'req789',
        notificationAudience: 'driver',
      }),
    ).toEqual({
      title: 'Documento vencido',
      body: 'Tienes un documento atrasado en este viaje.',
      data: {
        type: 'document_overdue',
        tripId: 'trip123',
        requirementId: 'req789',
      },
    });
    expect(
      buildNotificationMessage({
        kind: 'document_overdue',
        tripId: 'trip123',
        requirementId: 'req789',
        notificationAudience: 'staff',
      }),
    ).toEqual({
      title: 'Documento atrasado',
      body: 'Un documento requerido está vencido en un viaje.',
      data: {
        type: 'document_overdue',
        tripId: 'trip123',
        requirementId: 'req789',
      },
    });
  });

  test('builds phase two event keys', () => {
    expect(buildNotificationEventKey({ kind: 'trip_cancelled', tripId: 'trip123', driverId: 'driver456' })).toBe(
      'trip_cancelled:trip123:driver456',
    );
    expect(buildNotificationEventKey({ kind: 'offer_no_longer_available', offerId: 'offer456' })).toBe(
      'offer_no_longer_available:offer456',
    );
    expect(buildNotificationEventKey({ kind: 'company_document_available', documentId: 'doc456' })).toBe(
      'company_document_available:doc456',
    );
    expect(buildNotificationEventKey({ kind: 'document_due_soon', requirementId: 'req789', deadlineAt: 123 })).toBe(
      'document_due_soon:req789:123',
    );
    expect(
      buildNotificationEventKey({
        kind: 'document_overdue',
        requirementId: 'req789',
        deadlineAt: 123,
        notificationAudience: 'driver',
      }),
    ).toBe('document_overdue:driver:req789:123');
    expect(
      buildNotificationEventKey({
        kind: 'document_overdue',
        requirementId: 'req789',
        deadlineAt: 123,
        notificationAudience: 'staff',
      }),
    ).toBe('document_overdue:staff:req789:123');
  });

  test('keeps deadline event keys stable for the same requirement and deadline', () => {
    expect(buildNotificationEventKey({ kind: 'document_due_soon', requirementId: 'req789', deadlineAt: 123 })).toBe(
      buildNotificationEventKey({ kind: 'document_due_soon', requirementId: 'req789', deadlineAt: 123 }),
    );
    expect(buildNotificationEventKey({ kind: 'document_due_soon', requirementId: 'req789', deadlineAt: 456 })).not.toBe(
      buildNotificationEventKey({ kind: 'document_due_soon', requirementId: 'req789', deadlineAt: 123 }),
    );
  });

  test('chunks Expo messages and hides full push tokens in logs', () => {
    const messages = Array.from({ length: 101 }, (_, index) => ({
      to: `ExpoPushToken[test-${index}]`,
      title: 'Nuevo viaje disponible',
      body: 'Tienes una nueva oferta de viaje para revisar.',
      data: { type: 'new_trip_available' as const, tripId: 'trip123' },
    }));

    expect(chunkPushMessages(messages).map((chunk) => chunk.length)).toEqual([100, 1]);
    expect(getExpoPushTokenSuffix('ExpoPushToken[abcdef1234567890]')).toBe('567890]');
  });

  test('detects existing queued or successful events as duplicates', () => {
    expect(shouldIgnoreExistingNotificationEvent(undefined)).toBe(false);
    expect(shouldIgnoreExistingNotificationEvent({ status: 'failed' })).toBe(false);
    expect(shouldIgnoreExistingNotificationEvent({ status: 'queued' })).toBe(true);
    expect(shouldIgnoreExistingNotificationEvent({ status: 'sent' })).toBe(true);
  });
});
