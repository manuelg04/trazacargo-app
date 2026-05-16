import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  accessCodeStatusValidator,
  companyStatusValidator,
  driverStatusValidator,
  userProfileStatusValidator,
  userRoleValidator,
} from './schema';
import { Doc } from './_generated/dataModel';
import {
  assertDriverBelongsToCompany,
  assertSameCompany,
  getActiveProfile,
  requireAuthenticatedUser,
  requireDispatcherOrAdminProfile,
} from './lib/permissions';

const profileReturn = v.object({
  _id: v.id('userProfiles'),
  _creationTime: v.number(),
  userId: v.id('users'),
  companyId: v.id('companies'),
  driverId: v.optional(v.id('drivers')),
  role: userRoleValidator,
  status: userProfileStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const companyReturn = v.object({
  _id: v.id('companies'),
  _creationTime: v.number(),
  name: v.string(),
  city: v.string(),
  status: companyStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const driverReturn = v.object({
  _id: v.id('drivers'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  fullName: v.string(),
  phone: v.string(),
  documentNumber: v.string(),
  status: driverStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const accessCodeReturn = v.object({
  _id: v.id('accessCodes'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  driverId: v.optional(v.id('drivers')),
  role: userRoleValidator,
  code: v.string(),
  status: accessCodeStatusValidator,
  expiresAt: v.optional(v.number()),
  usedByUserId: v.optional(v.id('users')),
  usedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  driverName: v.optional(v.string()),
  usedByEmail: v.optional(v.string()),
});

const redeemedReturn = v.object({
  profile: profileReturn,
  company: companyReturn,
  driver: v.union(v.null(), driverReturn),
});

export const redeemAccessCode = mutation({
  args: {
    code: v.string(),
  },
  returns: redeemedReturn,
  handler: async (ctx, args) => {
    const { userId } = await requireAuthenticatedUser(ctx);
    const currentActiveProfile = await getActiveProfile(ctx, userId);

    if (currentActiveProfile) {
      return await buildProfileResult(ctx, currentActiveProfile);
    }

    const existingProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existingProfile) {
      throw new ConvexError('Tu usuario ya tiene un perfil registrado.');
    }

    const normalizedCode = args.code.trim().toUpperCase();

    if (!normalizedCode) {
      throw new ConvexError('Código inválido.');
    }

    const accessCode = await ctx.db
      .query('accessCodes')
      .withIndex('by_code', (q) => q.eq('code', normalizedCode))
      .first();

    if (!accessCode || accessCode.status === 'DISABLED') {
      throw new ConvexError('Código inválido.');
    }

    if (accessCode.status === 'USED') {
      throw new ConvexError('Este código ya fue usado.');
    }

    if (accessCode.status === 'EXPIRED') {
      throw new ConvexError('Este código expiró.');
    }

    const now = Date.now();

    if (accessCode.expiresAt !== undefined && accessCode.expiresAt <= now) {
      await ctx.db.patch(accessCode._id, {
        status: 'EXPIRED',
        updatedAt: now,
      });
      throw new ConvexError('Este código expiró.');
    }

    const company = await ctx.db.get(accessCode.companyId);
    const driver = accessCode.driverId ? await ctx.db.get(accessCode.driverId) : null;

    if (!company || company.status !== 'ACTIVE') {
      throw new ConvexError('Código inválido.');
    }

    if (accessCode.role === 'DRIVER') {
      if (!driver || driver.status !== 'ACTIVE' || driver.companyId !== accessCode.companyId) {
        throw new ConvexError('Código inválido.');
      }
    }

    const profileId = await ctx.db.insert('userProfiles', {
      userId,
      companyId: accessCode.companyId,
      driverId: accessCode.role === 'DRIVER' ? accessCode.driverId : undefined,
      role: accessCode.role,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(accessCode._id, {
      status: 'USED',
      usedByUserId: userId,
      usedAt: now,
      updatedAt: now,
    });

    const profile = await ctx.db.get(profileId);

    if (!profile) {
      throw new ConvexError('No se pudo activar el acceso.');
    }

    return {
      profile,
      company,
      driver,
    };
  },
});

export const listForCurrentCompany = query({
  args: {},
  returns: v.array(accessCodeReturn),
  handler: async (ctx) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const accessCodes = await ctx.db
      .query('accessCodes')
      .withIndex('by_company', (q) => q.eq('companyId', profile.companyId))
      .collect();
    const results: (Doc<'accessCodes'> & { driverName?: string; usedByEmail?: string })[] = [];

    for (const accessCode of accessCodes) {
      const driver = accessCode.driverId ? await ctx.db.get(accessCode.driverId) : null;
      const usedBy = accessCode.usedByUserId ? await ctx.db.get(accessCode.usedByUserId) : null;

      results.push({
        ...accessCode,
        driverName: driver?.fullName,
        usedByEmail: usedBy?.email,
      });
    }

    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createDriverAccessCode = mutation({
  args: {
    driverId: v.id('drivers'),
    expiresAt: v.optional(v.number()),
  },
  returns: accessCodeReturn,
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const driver = await assertDriverBelongsToCompany(ctx, args.driverId, profile.companyId);
    const now = Date.now();
    const code = await generateUniqueAccessCode(ctx, now);
    const accessCodeId = await ctx.db.insert('accessCodes', {
      companyId: profile.companyId,
      driverId: args.driverId,
      role: 'DRIVER',
      code,
      status: 'ACTIVE',
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });
    const accessCode = await ctx.db.get(accessCodeId);

    if (!accessCode) {
      throw new ConvexError('No se pudo crear el código.');
    }

    return { ...accessCode, driverName: driver.fullName };
  },
});

export const createDispatcherAccessCode = mutation({
  args: {
    role: v.union(v.literal('DISPATCHER'), v.literal('ADMIN')),
    expiresAt: v.optional(v.number()),
  },
  returns: accessCodeReturn,
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);

    if (profile.role !== 'ADMIN') {
      throw new ConvexError('Solo un administrador puede crear accesos administrativos.');
    }

    const now = Date.now();
    const code = await generateUniqueAccessCode(ctx, now);
    const accessCodeId = await ctx.db.insert('accessCodes', {
      companyId: profile.companyId,
      role: args.role,
      code,
      status: 'ACTIVE',
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });
    const accessCode = await ctx.db.get(accessCodeId);

    if (!accessCode) {
      throw new ConvexError('No se pudo crear el código.');
    }

    return accessCode;
  },
});

export const disableAccessCode = mutation({
  args: {
    accessCodeId: v.id('accessCodes'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const accessCode = await ctx.db.get(args.accessCodeId);

    if (!accessCode) {
      throw new ConvexError('El código no existe.');
    }

    assertSameCompany(accessCode.companyId, profile.companyId);

    if (accessCode.status === 'USED') {
      throw new ConvexError('No se puede deshabilitar un código usado.');
    }

    if (accessCode.status !== 'DISABLED') {
      await ctx.db.patch(args.accessCodeId, {
        status: 'DISABLED',
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

async function buildProfileResult(
  ctx: Parameters<typeof getActiveProfile>[0],
  profile: NonNullable<Awaited<ReturnType<typeof getActiveProfile>>>,
) {
  const company = await ctx.db.get(profile.companyId);
  const driver = profile.driverId ? await ctx.db.get(profile.driverId) : null;

  if (!company) {
    throw new ConvexError('Tu perfil no está disponible.');
  }

  return {
    profile,
    company,
    driver,
  };
}

async function generateUniqueAccessCode(ctx: Parameters<typeof getActiveProfile>[0], now: number) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = buildAccessCode(now, attempt);
    const existingCode = await ctx.db
      .query('accessCodes')
      .withIndex('by_code', (q) => q.eq('code', code))
      .first();

    if (!existingCode) {
      return code;
    }
  }

  throw new ConvexError('No se pudo generar un código único.');
}

function buildAccessCode(now: number, attempt: number) {
  const seed = (now + attempt).toString(36).toUpperCase().padStart(8, '0');
  return `TC-${seed.slice(-8, -4)}-${seed.slice(-4)}`;
}
