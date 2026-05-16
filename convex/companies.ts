import { v } from 'convex/values';
import { query } from './_generated/server';
import { companyStatusValidator } from './schema';
import { requireActiveProfile } from './lib/permissions';

const companyReturn = v.object({
  _id: v.id('companies'),
  _creationTime: v.number(),
  name: v.string(),
  city: v.string(),
  status: companyStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const getCurrentCompany = query({
  args: {},
  returns: companyReturn,
  handler: async (ctx) => {
    const { company } = await requireActiveProfile(ctx);

    return company;
  },
});
