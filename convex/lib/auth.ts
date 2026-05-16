import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import { Doc, Id } from '../_generated/dataModel';
import { MutationCtx, QueryCtx } from '../_generated/server';

type AuthCtx = QueryCtx | MutationCtx;

export type ActiveProfile = Doc<'userProfiles'>;

export async function requireAuthenticatedUser(ctx: AuthCtx) {
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    throw new ConvexError('Debes iniciar sesión.');
  }

  const user = await ctx.db.get(userId);

  if (!user) {
    throw new ConvexError('Debes iniciar sesión.');
  }

  return { userId, user };
}

export async function getActiveProfile(ctx: AuthCtx, userId: Id<'users'>) {
  const profile = await ctx.db
    .query('userProfiles')
    .withIndex('by_user_and_status', (q) => q.eq('userId', userId).eq('status', 'ACTIVE'))
    .first();

  return profile;
}

export async function requireActiveProfile(ctx: AuthCtx) {
  const { userId, user } = await requireAuthenticatedUser(ctx);
  const profile = await getActiveProfile(ctx, userId);

  if (!profile) {
    throw new ConvexError('Tu usuario no tiene un perfil activo.');
  }

  return { userId, user, profile };
}

export async function requireDriverProfile(ctx: AuthCtx) {
  const { userId, user, profile } = await requireActiveProfile(ctx);
  const driverId = profile.driverId;

  if (profile.role !== 'DRIVER' || !driverId) {
    throw new ConvexError('Este perfil no puede usar el flujo de conductor.');
  }

  const company = await ctx.db.get(profile.companyId);
  const driver = await ctx.db.get(driverId);

  if (!company || company.status !== 'ACTIVE' || !driver || driver.status !== 'ACTIVE') {
    throw new ConvexError('Tu perfil no está disponible.');
  }

  if (driver.companyId !== profile.companyId) {
    throw new ConvexError('Tu perfil no está disponible.');
  }

  return { userId, user, profile, company, driver, driverId };
}

export async function assertDriverCanAccessTrip(ctx: AuthCtx, profile: ActiveProfile, tripId: Id<'trips'>) {
  const driverId = profile.driverId;

  if (profile.role !== 'DRIVER' || !driverId) {
    throw new ConvexError('Este perfil no puede usar el flujo de conductor.');
  }

  const trip = await ctx.db.get(tripId);

  if (!trip || trip.companyId !== profile.companyId) {
    throw new ConvexError('No tienes acceso a este viaje.');
  }

  const offer = await ctx.db
    .query('tripOffers')
    .withIndex('by_trip_and_driver', (q) => q.eq('tripId', tripId).eq('driverId', driverId))
    .first();
  const belongsToDriver = trip.acceptedByDriverId === driverId || trip.assignedDriverId === driverId;

  if (!offer && !belongsToDriver) {
    throw new ConvexError('No tienes acceso a este viaje.');
  }

  return { trip, offer, belongsToDriver, driverId };
}
