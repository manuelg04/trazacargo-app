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
