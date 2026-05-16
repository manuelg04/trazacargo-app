import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { companyStatusValidator, driverStatusValidator, vehicleStatusValidator } from './schema';
import { Doc } from './_generated/dataModel';
import { requireDispatcherOrAdminProfile } from './lib/permissions';

const companyReturn = v.object({
  _id: v.id('companies'),
  _creationTime: v.number(),
  name: v.string(),
  city: v.string(),
  status: companyStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

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

const driverFields = {
  _id: v.id('drivers'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  fullName: v.string(),
  phone: v.string(),
  documentNumber: v.string(),
  status: driverStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
};

const driverReturn = v.object(driverFields);

const driverWithVehicleReturn = v.object({
  ...driverFields,
  vehicle: v.union(v.null(), vehicleReturn),
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

export const listForCurrentCompany = query({
  args: {},
  returns: v.array(driverWithVehicleReturn),
  handler: async (ctx) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const drivers = await ctx.db
      .query('drivers')
      .withIndex('by_company', (q) => q.eq('companyId', profile.companyId))
      .collect();
    const vehicles = await ctx.db
      .query('vehicles')
      .withIndex('by_company', (q) => q.eq('companyId', profile.companyId))
      .collect();
    const vehiclesByDriverId = new Map<string, Doc<'vehicles'>>();

    for (const vehicle of vehicles) {
      if (vehicle.driverId) {
        vehiclesByDriverId.set(vehicle.driverId, vehicle);
      }
    }

    return drivers
      .map((driver) => ({
        ...driver,
        vehicle: vehiclesByDriverId.get(driver._id) ?? null,
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  },
});

export const createForCurrentCompany = mutation({
  args: {
    fullName: v.string(),
    phone: v.string(),
    documentNumber: v.string(),
    vehiclePlate: v.optional(v.string()),
    vehicleType: v.optional(v.string()),
  },
  returns: v.object({
    driver: driverReturn,
    vehicle: v.union(v.null(), vehicleReturn),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const now = Date.now();
    const fullName = args.fullName.trim();
    const phone = args.phone.trim();
    const documentNumber = args.documentNumber.trim();
    const vehiclePlate = args.vehiclePlate?.trim().toUpperCase();
    const vehicleType = args.vehicleType?.trim();

    if (!fullName || !phone || !documentNumber) {
      throw new ConvexError('Completa nombre, teléfono y documento.');
    }

    const existingDrivers = await ctx.db
      .query('drivers')
      .withIndex('by_company', (q) => q.eq('companyId', profile.companyId))
      .collect();
    const duplicatedDriver = existingDrivers.find((driver) => driver.documentNumber === documentNumber);

    if (duplicatedDriver) {
      throw new ConvexError('Ya existe un conductor con ese documento.');
    }

    const driverId = await ctx.db.insert('drivers', {
      companyId: profile.companyId,
      fullName,
      phone,
      documentNumber,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
    const vehicleId =
      vehiclePlate && vehicleType
        ? await ctx.db.insert('vehicles', {
            companyId: profile.companyId,
            driverId,
            plate: vehiclePlate,
            vehicleType,
            status: 'ACTIVE',
            createdAt: now,
            updatedAt: now,
          })
        : null;
    const driver = await ctx.db.get(driverId);
    const vehicle = vehicleId ? await ctx.db.get(vehicleId) : null;

    if (!driver) {
      throw new ConvexError('No se pudo crear el conductor.');
    }

    return { driver, vehicle };
  },
});
