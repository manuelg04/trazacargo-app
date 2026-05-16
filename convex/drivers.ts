import { query } from './_generated/server';
import { v } from 'convex/values';
import { companyStatusValidator, driverStatusValidator } from './schema';
import { Doc } from './_generated/dataModel';

const companyReturn = v.object({
  _id: v.id('companies'),
  _creationTime: v.number(),
  name: v.string(),
  city: v.string(),
  status: companyStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const listDemoDrivers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('drivers'),
      _creationTime: v.number(),
      companyId: v.id('companies'),
      fullName: v.string(),
      phone: v.string(),
      documentNumber: v.string(),
      status: driverStatusValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
      company: companyReturn,
    }),
  ),
  handler: async (ctx) => {
    const drivers = await ctx.db
      .query('drivers')
      .withIndex('by_status', (q) => q.eq('status', 'ACTIVE'))
      .collect();
    const results: (Doc<'drivers'> & { company: Doc<'companies'> })[] = [];

    for (const driver of drivers) {
      const company = await ctx.db.get(driver.companyId);

      if (company && company.name === 'Transportes Demo Bucaramanga' && company.status === 'ACTIVE') {
        results.push({ ...driver, company });
      }
    }

    return results.sort((a, b) => a.fullName.localeCompare(b.fullName));
  },
});
