import { v } from 'convex/values';
import { query } from './_generated/server';
import { vehicleStatusValidator } from './schema';
import { requireDispatcherOrAdminProfile } from './lib/permissions';

const vehicleReturn = v.object({
  _id: v.id('vehicles'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  driverId: v.optional(v.id('drivers')),
  plate: v.string(),
  vehicleType: v.string(),
  status: vehicleStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const listForCurrentCompany = query({
  args: {},
  returns: v.array(vehicleReturn),
  handler: async (ctx) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const vehicles = await ctx.db
      .query('vehicles')
      .withIndex('by_company', (q) => q.eq('companyId', profile.companyId))
      .collect();

    return vehicles.sort((a, b) => a.plate.localeCompare(b.plate));
  },
});
