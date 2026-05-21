import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import { internalAction, internalMutation, internalQuery, MutationCtx } from './_generated/server';
import { notificationEventStatusValidator, pushNotificationDataValidator, pushNotificationKindValidator } from './schema';
import {
  ExpoPushMessage,
  PushNotificationKind,
  PushNotificationAudience,
  PushNotificationReviewStatus,
  buildNotificationEventKey,
  buildNotificationMessage,
  chunkPushMessages,
  getExpoPushTokenSuffix,
  shouldIgnoreExistingNotificationEvent,
} from './lib/pushNotificationMessages';

const targetValidator = v.union(v.literal('drivers'), v.literal('dispatcher_admins'));
const reviewStatusValidator = v.union(v.literal('APPROVED'), v.literal('REJECTED'));

type QueueNotificationInput = {
  kind: PushNotificationKind;
  companyId: Id<'companies'>;
  tripId: Id<'trips'>;
  driverIds?: Id<'drivers'>[];
  driverId?: Id<'drivers'>;
  documentId?: Id<'tripDocuments'>;
  requirementId?: Id<'tripDocumentRequirements'>;
  offerId?: Id<'tripOffers'>;
  reviewStatus?: PushNotificationReviewStatus;
  deadlineAt?: number;
  notificationAudience?: PushNotificationAudience;
  ignoreAnyExistingEvent?: boolean;
  target: 'drivers' | 'dispatcher_admins';
};

export async function queuePushNotification(ctx: MutationCtx, input: QueueNotificationInput) {
  const eventKey = buildNotificationEventKey({
    kind: input.kind,
    offerId: input.offerId,
    tripId: input.tripId,
    driverId: input.driverId,
    documentId: input.documentId,
    requirementId: input.requirementId,
    reviewStatus: input.reviewStatus,
    deadlineAt: input.deadlineAt,
    notificationAudience: input.notificationAudience,
  });
  const existingEvent = await ctx.db
    .query('notificationEvents')
    .withIndex('by_eventKey', (q) => q.eq('eventKey', eventKey))
    .first();

  if (input.ignoreAnyExistingEvent && existingEvent) {
    return null;
  }

  if (shouldIgnoreExistingNotificationEvent(existingEvent ?? undefined)) {
    return null;
  }

  const message = buildNotificationMessage({
    kind: input.kind,
    tripId: input.tripId,
    documentId: input.documentId,
    requirementId: input.requirementId,
    offerId: input.offerId,
    reviewStatus: input.reviewStatus,
    notificationAudience: input.notificationAudience,
  });
  const now = Date.now();
  const hasActiveTokens = await hasActiveTargetTokens(ctx, input);
  const eventId = await ctx.db.insert('notificationEvents', {
    kind: input.kind,
    status: hasActiveTokens ? 'queued' : 'skipped',
    companyId: input.companyId,
    tripId: input.tripId,
    driverId: input.driverId,
    title: message.title,
    body: message.body,
    data: message.data,
    eventKey,
    createdAt: now,
    updatedAt: now,
  });

  if (!hasActiveTokens) {
    await ctx.db.patch(eventId, {
      error: 'No active push tokens found',
      updatedAt: now,
    });
    return eventId;
  }

  await ctx.scheduler.runAfter(0, internal.pushNotifications.sendQueuedNotification, {
    eventId,
    kind: input.kind,
    companyId: input.companyId,
    tripId: input.tripId,
    driverIds: input.driverIds,
    driverId: input.driverId,
    documentId: input.documentId,
    requirementId: input.requirementId,
    offerId: input.offerId,
    reviewStatus: input.reviewStatus,
    deadlineAt: input.deadlineAt,
    notificationAudience: input.notificationAudience,
    target: input.target,
    eventKey,
  });

  return eventId;
}

export const sendQueuedNotification = internalAction({
  args: {
    eventId: v.id('notificationEvents'),
    kind: pushNotificationKindValidator,
    companyId: v.id('companies'),
    tripId: v.id('trips'),
    driverIds: v.optional(v.array(v.id('drivers'))),
    driverId: v.optional(v.id('drivers')),
    documentId: v.optional(v.id('tripDocuments')),
    requirementId: v.optional(v.id('tripDocumentRequirements')),
    offerId: v.optional(v.id('tripOffers')),
    reviewStatus: v.optional(reviewStatusValidator),
    deadlineAt: v.optional(v.number()),
    notificationAudience: v.optional(v.union(v.literal('driver'), v.literal('staff'))),
    target: targetValidator,
    eventKey: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const tokens =
      args.target === 'drivers'
        ? await ctx.runQuery(internal.pushTokens.listActiveTokensForDrivers, {
            companyId: args.companyId,
            driverIds: args.driverIds ?? [],
          })
        : await ctx.runQuery(internal.pushTokens.listActiveDispatcherAdminTokensForCompany, {
            companyId: args.companyId,
          });

    if (tokens.length === 0) {
      await ctx.runMutation(internal.pushNotifications.updateNotificationEvent, {
        eventId: args.eventId,
        status: 'skipped',
        error: 'No active push tokens found',
      });
      return null;
    }

    const message = buildNotificationMessage({
      kind: args.kind,
      tripId: args.tripId,
      documentId: args.documentId,
      requirementId: args.requirementId,
      offerId: args.offerId,
      reviewStatus: args.reviewStatus,
      notificationAudience: args.notificationAudience,
    });
    const pushMessages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token.expoPushToken,
      title: message.title,
      body: message.body,
      data: message.data,
    }));
    let successfulTickets = 0;
    const ticketIds: string[] = [];

    try {
      for (const messageChunk of chunkPushMessages(pushMessages)) {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(messageChunk),
        });

        if (!response.ok) {
          await ctx.runMutation(internal.pushNotifications.updateNotificationEvent, {
            eventId: args.eventId,
            status: 'failed',
            error: `Expo Push Service responded with ${response.status}`,
          });
          return null;
        }

        const result = (await response.json()) as ExpoPushSendResponse;
        const tickets = Array.isArray(result.data) ? result.data : [result.data];

        for (let index = 0; index < tickets.length; index += 1) {
          const ticket = tickets[index];
          const pushMessage = messageChunk[index];
          const token = tokens.find((item) => item.expoPushToken === pushMessage.to);

          if (!token) {
            continue;
          }

          const status = ticket.status === 'ok' ? 'sent' : 'ticket_error';
          const error = ticket.status === 'error' ? formatExpoError(ticket) : undefined;

          if (ticket.status === 'ok') {
            successfulTickets += 1;

            if (ticket.id) {
              ticketIds.push(ticket.id);
            }
          }

          await ctx.runMutation(internal.pushNotifications.createNotificationEvent, {
            kind: args.kind,
            status,
            companyId: args.companyId,
            tripId: args.tripId,
            driverId: token.driverId,
            userProfileId: token.userProfileId,
            pushTokenId: token._id,
            expoPushTokenSuffix: getExpoPushTokenSuffix(token.expoPushToken),
            title: message.title,
            body: message.body,
            data: message.data,
            eventKey: `${args.eventKey}:${token._id}`,
            expoTicketId: ticket.id,
            expoTicketStatus: ticket.status,
            error,
          });

          if (ticket.status === 'error') {
            await ctx.runMutation(internal.pushTokens.updateTokenLastError, {
              pushTokenId: token._id,
              error: error ?? 'Expo ticket error',
            });

            if (ticket.details?.error === 'DeviceNotRegistered') {
              await ctx.runMutation(internal.pushTokens.markTokenInactive, {
                pushTokenId: token._id,
                reason: 'DeviceNotRegistered',
              });
            }
          }
        }
      }
    } catch (error) {
      await ctx.runMutation(internal.pushNotifications.updateNotificationEvent, {
        eventId: args.eventId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Expo Push Service request failed',
      });
      return null;
    }

    await ctx.runMutation(internal.pushNotifications.updateNotificationEvent, {
      eventId: args.eventId,
      status: successfulTickets > 0 ? 'sent' : 'failed',
      expoTicketStatus: successfulTickets > 0 ? 'ok' : 'error',
      error: successfulTickets > 0 ? undefined : 'No successful Expo tickets',
    });

    if (ticketIds.length > 0) {
      await ctx.scheduler.runAfter(60_000, internal.pushNotifications.checkExpoReceipts, {
        ticketIds,
      });
    }

    return null;
  },
});

export const checkExpoReceipts = internalAction({
  args: {
    ticketIds: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const ticketChunk of chunkPushMessages(args.ticketIds, 100)) {
      const response = await fetch('https://exp.host/--/api/v2/push/getReceipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ ids: ticketChunk }),
      });

      if (!response.ok) {
        continue;
      }

      const result = (await response.json()) as ExpoPushReceiptResponse;

      for (const ticketId of ticketChunk) {
        const receipt = result.data[ticketId];

        if (!receipt) {
          continue;
        }

        await ctx.runMutation(internal.pushNotifications.updateNotificationEventsByTicketId, {
          expoTicketId: ticketId,
          expoReceiptStatus: receipt.status,
          status: receipt.status === 'ok' ? 'sent' : 'receipt_error',
          error: receipt.status === 'error' ? formatExpoError(receipt) : undefined,
          shouldDisableToken: receipt.details?.error === 'DeviceNotRegistered',
        });
      }
    }

    return null;
  },
});

export const findNotificationEventByEventKey = internalQuery({
  args: {
    eventKey: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('notificationEvents'),
      status: notificationEventStatusValidator,
    }),
  ),
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query('notificationEvents')
      .withIndex('by_eventKey', (q) => q.eq('eventKey', args.eventKey))
      .first();

    if (!event) {
      return null;
    }

    return { _id: event._id, status: event.status };
  },
});

export const createNotificationEvent = internalMutation({
  args: {
    kind: pushNotificationKindValidator,
    status: notificationEventStatusValidator,
    companyId: v.optional(v.id('companies')),
    tripId: v.optional(v.id('trips')),
    driverId: v.optional(v.id('drivers')),
    userProfileId: v.optional(v.id('userProfiles')),
    pushTokenId: v.optional(v.id('pushTokens')),
    expoPushTokenSuffix: v.optional(v.string()),
    title: v.string(),
    body: v.string(),
    data: v.optional(pushNotificationDataValidator),
    eventKey: v.optional(v.string()),
    expoTicketId: v.optional(v.string()),
    expoTicketStatus: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.id('notificationEvents'),
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert('notificationEvents', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateNotificationEvent = internalMutation({
  args: {
    eventId: v.id('notificationEvents'),
    status: notificationEventStatusValidator,
    expoTicketStatus: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: args.status,
      expoTicketStatus: args.expoTicketStatus,
      error: args.error,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const updateNotificationEventsByTicketId = internalMutation({
  args: {
    expoTicketId: v.string(),
    expoReceiptStatus: v.string(),
    status: notificationEventStatusValidator,
    error: v.optional(v.string()),
    shouldDisableToken: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('notificationEvents')
      .withIndex('by_expoTicketId', (q) => q.eq('expoTicketId', args.expoTicketId))
      .collect();

    for (const event of events) {
      await ctx.db.patch(event._id, {
        status: args.status,
        expoReceiptStatus: args.expoReceiptStatus,
        error: args.error,
        updatedAt: Date.now(),
      });

      if (args.shouldDisableToken && event.pushTokenId) {
        await ctx.db.patch(event.pushTokenId, {
          isActive: false,
          disabledAt: Date.now(),
          disabledReason: 'DeviceNotRegistered',
          lastError: args.error ?? 'DeviceNotRegistered',
          updatedAt: Date.now(),
        });
      }
    }

    return null;
  },
});

type ExpoPushTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
};

type ExpoPushSendResponse = {
  data: ExpoPushTicket[] | ExpoPushTicket;
};

type ExpoPushReceiptResponse = {
  data: Record<string, ExpoPushTicket>;
};

function formatExpoError(ticket: Pick<ExpoPushTicket, 'message' | 'details'>) {
  return ticket.details?.error ? `${ticket.details.error}: ${ticket.message ?? 'Expo push error'}` : ticket.message;
}

async function hasActiveTargetTokens(ctx: MutationCtx, input: QueueNotificationInput) {
  if (input.target === 'drivers') {
    for (const driverId of input.driverIds ?? []) {
      const token = await ctx.db
        .query('pushTokens')
        .withIndex('by_driver_active', (q) => q.eq('driverId', driverId).eq('isActive', true))
        .first();

      if (token && token.companyId === input.companyId && token.role === 'DRIVER') {
        return true;
      }
    }

    return false;
  }

  const dispatcherToken = await ctx.db
    .query('pushTokens')
    .withIndex('by_company_role_active', (q) => q.eq('companyId', input.companyId).eq('role', 'DISPATCHER').eq('isActive', true))
    .first();

  if (dispatcherToken) {
    return true;
  }

  const adminToken = await ctx.db
    .query('pushTokens')
    .withIndex('by_company_role_active', (q) => q.eq('companyId', input.companyId).eq('role', 'ADMIN').eq('isActive', true))
    .first();

  return Boolean(adminToken);
}
