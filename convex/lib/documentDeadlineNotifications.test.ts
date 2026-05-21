import { describe, expect, test } from 'vitest';
import {
  DOCUMENT_DUE_SOON_WINDOW_MS,
  shouldNotifyDocumentDueSoon,
  shouldNotifyDocumentOverdue,
} from './documentDeadlineNotifications';

const activeTrip = {
  status: 'ACCEPTED' as const,
  acceptedByDriverId: 'driver123',
};

const actionableRequirement = {
  required: true,
  status: 'PENDING' as const,
  direction: 'DRIVER_TO_COMPANY' as const,
};

describe('documentDeadlineNotifications', () => {
  test('detects requirements due within the next 24 hours', () => {
    const now = 1_000;

    expect(
      shouldNotifyDocumentDueSoon(
        {
          ...actionableRequirement,
          dueAt: now + DOCUMENT_DUE_SOON_WINDOW_MS,
        },
        activeTrip,
        now,
      ),
    ).toBe(true);
    expect(
      shouldNotifyDocumentDueSoon(
        {
          ...actionableRequirement,
          dueAt: now + DOCUMENT_DUE_SOON_WINDOW_MS + 1,
        },
        activeTrip,
        now,
      ),
    ).toBe(false);
    expect(
      shouldNotifyDocumentDueSoon(
        {
          ...actionableRequirement,
          dueAt: now,
        },
        activeTrip,
        now,
      ),
    ).toBe(false);
  });

  test('detects overdue requirements', () => {
    const now = 1_000;

    expect(
      shouldNotifyDocumentOverdue(
        {
          ...actionableRequirement,
          dueAt: now,
        },
        activeTrip,
        now,
      ),
    ).toBe(true);
    expect(
      shouldNotifyDocumentOverdue(
        {
          ...actionableRequirement,
          dueAt: now + 1,
        },
        activeTrip,
        now,
      ),
    ).toBe(false);
  });

  test('does not notify waived or satisfied requirements', () => {
    const now = 1_000;

    for (const status of ['WAIVED', 'SATISFIED'] as const) {
      expect(
        shouldNotifyDocumentDueSoon(
          {
            ...actionableRequirement,
            status,
            dueAt: now + 1,
          },
          activeTrip,
          now,
        ),
      ).toBe(false);
      expect(
        shouldNotifyDocumentOverdue(
          {
            ...actionableRequirement,
            status,
            dueAt: now,
          },
          activeTrip,
          now,
        ),
      ).toBe(false);
    }
  });

  test('does not notify requirements already in review', () => {
    const now = 1_000;

    expect(
      shouldNotifyDocumentDueSoon(
        {
          ...actionableRequirement,
          status: 'IN_REVIEW',
          dueAt: now + 1,
        },
        activeTrip,
        now,
      ),
    ).toBe(false);
    expect(
      shouldNotifyDocumentOverdue(
        {
          ...actionableRequirement,
          status: 'IN_REVIEW',
          dueAt: now,
        },
        activeTrip,
        now,
      ),
    ).toBe(false);
  });

  test('does not notify inactive trips', () => {
    const now = 1_000;

    for (const status of ['CANCELLED', 'CLOSED'] as const) {
      expect(
        shouldNotifyDocumentDueSoon(
          {
            ...actionableRequirement,
            dueAt: now + 1,
          },
          { ...activeTrip, status },
          now,
        ),
      ).toBe(false);
      expect(
        shouldNotifyDocumentOverdue(
          {
            ...actionableRequirement,
            dueAt: now,
          },
          { ...activeTrip, status },
          now,
        ),
      ).toBe(false);
    }
  });

  test('does not notify when there is no driver action or no responsible driver', () => {
    const now = 1_000;

    expect(
      shouldNotifyDocumentDueSoon(
        {
          ...actionableRequirement,
          direction: 'COMPANY_TO_DRIVER',
          dueAt: now + 1,
        },
        activeTrip,
        now,
      ),
    ).toBe(false);
    expect(
      shouldNotifyDocumentOverdue(
        {
          ...actionableRequirement,
          required: false,
          dueAt: now,
        },
        activeTrip,
        now,
      ),
    ).toBe(false);
    expect(
      shouldNotifyDocumentOverdue(
        {
          ...actionableRequirement,
          dueAt: now,
        },
        { status: 'ACCEPTED' },
        now,
      ),
    ).toBe(false);
  });
});
