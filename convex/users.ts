import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { query } from './_generated/server';
import {
  companyStatusValidator,
  driverStatusValidator,
  userProfileStatusValidator,
  userRoleValidator,
} from './schema';

const userReturn = v.object({
  _id: v.id('users'),
  _creationTime: v.number(),
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
});

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
  vehicleType: v.optional(v.string()),
  status: driverStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const getCurrentUserProfile = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      user: userReturn,
      profile: v.union(v.null(), profileReturn),
      company: v.union(v.null(), companyReturn),
      driver: v.union(v.null(), driverReturn),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!profile || profile.status !== 'ACTIVE') {
      return {
        user,
        profile: profile ?? null,
        company: null,
        driver: null,
      };
    }

    const company = await ctx.db.get(profile.companyId);
    const driver = profile.driverId ? await ctx.db.get(profile.driverId) : null;

    return {
      user,
      profile,
      company,
      driver,
    };
  },
});
