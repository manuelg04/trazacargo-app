import { ConvexError, v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';
import { internalMutation, internalQuery, mutation } from './_generated/server';
import { pushPlatformValidator } from './schema';
import { requireActiveProfile } from './lib/permissions';

const tokenReturn = v.object({
  _id: v.id('pushTokens'),
  expoPushToken: v.string(),
  userProfileId: v.id('userProfiles'),
  companyId: v.id('companies'),
  role: v.union(v.literal('DRIVER'), v.literal('DISPATCHER'), v.literal('ADMIN')),
  driverId: v.optional(v.id('drivers')),
  platform: pushPlatformValidator,
  projectId: v.optional(v.string()),
  appOwnership: v.optional(v.string()),
  deviceName: v.optional(v.string()),
  isActive: v.boolean(),
});

export const registerForCurrentProfile = mutation({
  args: {
    expoPushToken: v.string(),
    platform: pushPlatformValidator,
    projectId: v.optional(v.string()),
    appOwnership: v.optional(v.string()),
    deviceName: v.optional(v.string()),
  },
  returns: v.union(v.null(), v.object({ tokenId: v.id('pushTokens'), isActive: v.boolean() })),
  handler: async (ctx, args) => {
    const { profile } = await requireActiveProfile(ctx);
    const expoPushToken = args.expoPushToken.trim();

    if (!isExpoPushToken(expoPushToken)) {
      throw new ConvexError('El token de notificaciones no es válido.');
    }

    const now = Date.now();
    const sameProfileToken = await ctx.db
      .query('pushTokens')
      .withIndex('by_profile_token', (q) => q.eq('userProfileId', profile._id).eq('expoPushToken', expoPushToken))
      .first();

    const previousTokenLinks = await ctx.db
      .query('pushTokens')
      .withIndex('by_expoPushToken', (q) => q.eq('expoPushToken', expoPushToken))
      .collect();

    for (const tokenLink of previousTokenLinks) {
      if (tokenLink.userProfileId !== profile._id && tokenLink.isActive) {
        await ctx.db.patch(tokenLink._id, {
          isActive: false,
          disabledAt: now,
          disabledReason: 'reassigned_to_current_profile',
          updatedAt: now,
        });
      }
    }

    if (sameProfileToken) {
      await ctx.db.patch(sameProfileToken._id, {
        companyId: profile.companyId,
        role: profile.role,
        driverId: profile.driverId,
        platform: args.platform,
        projectId: normalizeOptionalText(args.projectId),
        appOwnership: normalizeOptionalText(args.appOwnership),
        deviceName: normalizeOptionalText(args.deviceName),
        isActive: true,
        lastSeenAt: now,
        updatedAt: now,
        disabledAt: undefined,
        disabledReason: undefined,
        lastError: undefined,
      });

      return { tokenId: sameProfileToken._id, isActive: true };
    }

    const tokenId = await ctx.db.insert('pushTokens', {
      expoPushToken,
      userProfileId: profile._id,
      companyId: profile.companyId,
      role: profile.role,
      driverId: profile.driverId,
      platform: args.platform,
      projectId: normalizeOptionalText(args.projectId),
      appOwnership: normalizeOptionalText(args.appOwnership),
      deviceName: normalizeOptionalText(args.deviceName),
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    });

    return { tokenId, isActive: true };
  },
});

export const disableForCurrentProfile = mutation({
  args: {
    expoPushToken: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireActiveProfile(ctx);
    const now = Date.now();
    const expoPushToken = args.expoPushToken;
    const tokens = expoPushToken
      ? await ctx.db
          .query('pushTokens')
          .withIndex('by_profile_token', (q) => q.eq('userProfileId', profile._id).eq('expoPushToken', expoPushToken))
          .collect()
      : await ctx.db
          .query('pushTokens')
          .withIndex('by_profile', (q) => q.eq('userProfileId', profile._id))
          .collect();

    for (const token of tokens) {
      if (token.isActive) {
        await ctx.db.patch(token._id, {
          isActive: false,
          disabledAt: now,
          disabledReason: 'disabled_by_current_profile',
          updatedAt: now,
        });
      }
    }

    return null;
  },
});

export const listActiveTokensForDrivers = internalQuery({
  args: {
    driverIds: v.array(v.id('drivers')),
    companyId: v.id('companies'),
  },
  returns: v.array(tokenReturn),
  handler: async (ctx, args) => {
    const tokensById = new Map<Id<'pushTokens'>, Doc<'pushTokens'>>();

    for (const driverId of Array.from(new Set(args.driverIds))) {
      const tokens = await ctx.db
        .query('pushTokens')
        .withIndex('by_driver_active', (q) => q.eq('driverId', driverId).eq('isActive', true))
        .collect();

      for (const token of tokens) {
        if (token.companyId === args.companyId && token.role === 'DRIVER') {
          tokensById.set(token._id, token);
        }
      }
    }

    return Array.from(tokensById.values());
  },
});

export const listActiveDispatcherAdminTokensForCompany = internalQuery({
  args: {
    companyId: v.id('companies'),
  },
  returns: v.array(tokenReturn),
  handler: async (ctx, args) => {
    const dispatcherTokens = await ctx.db
      .query('pushTokens')
      .withIndex('by_company_role_active', (q) => q.eq('companyId', args.companyId).eq('role', 'DISPATCHER').eq('isActive', true))
      .collect();
    const adminTokens = await ctx.db
      .query('pushTokens')
      .withIndex('by_company_role_active', (q) => q.eq('companyId', args.companyId).eq('role', 'ADMIN').eq('isActive', true))
      .collect();

    return [...dispatcherTokens, ...adminTokens];
  },
});

export const markTokenInactive = internalMutation({
  args: {
    pushTokenId: v.id('pushTokens'),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const token = await ctx.db.get(args.pushTokenId);

    if (!token) {
      return null;
    }

    const now = Date.now();
    await ctx.db.patch(args.pushTokenId, {
      isActive: false,
      disabledAt: now,
      disabledReason: args.reason,
      lastError: args.reason,
      updatedAt: now,
    });

    return null;
  },
});

export const updateTokenLastError = internalMutation({
  args: {
    pushTokenId: v.id('pushTokens'),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const token = await ctx.db.get(args.pushTokenId);

    if (!token) {
      return null;
    }

    await ctx.db.patch(args.pushTokenId, {
      lastError: args.error,
      updatedAt: Date.now(),
    });

    return null;
  },
});

function normalizeOptionalText(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function isExpoPushToken(value: string) {
  return value.startsWith('ExpoPushToken[') || value.startsWith('ExponentPushToken[');
}
