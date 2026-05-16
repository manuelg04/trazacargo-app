import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';
import {
  companyStatusValidator,
  driverStatusValidator,
  userProfileStatusValidator,
  userRoleValidator,
} from './schema';
import { getActiveProfile, requireAuthenticatedUser } from './lib/auth';

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

async function buildProfileResult(ctx: Parameters<typeof getActiveProfile>[0], profile: NonNullable<Awaited<ReturnType<typeof getActiveProfile>>>) {
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
