# TrazaCargo

TrazaCargo is an Expo mobile app foundation for Colombian cargo transport companies and truck drivers. Phase 2 adds real email/password access with Convex Auth and links each signed-in user to an operational company and driver profile.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- Convex
- Convex Auth
- npm

## Install

```bash
npm install
```

## Environment

Create `.env.local` from `.env.example` and set the local Convex values:

```bash
EXPO_PUBLIC_CONVEX_URL=https://scintillating-bulldog-845.convex.cloud
CONVEX_DEPLOYMENT=dev:scintillating-bulldog-845
```

Convex Auth stores its JWT keys in the Convex deployment environment. Run the initializer again only if you create a new Convex deployment:

```bash
npx @convex-dev/auth
```

## Run Convex

```bash
npx convex dev
```

Keep this running while you work. It syncs backend functions and keeps generated types updated.

## Run Expo

In another terminal:

```bash
npm run start
```

You can also run:

```bash
npm run ios
npm run android
npm run web
```

## Demo Data

Seed the demo company, drivers, trips, offers, documents, events, and access codes:

```bash
npx convex run dev:seedDemoData
```

The development screen is also available at `/(dev)/seed` inside the app.

Current demo driver codes:

- `TC-CARLOS-2026`
- `TC-JULIAN-2026`

Clear only the demo domain data with:

```bash
npx convex run dev:clearDemoData
```

This does not delete Convex Auth users.

## Test The Auth Flow

1. Run `npx convex dev`.
2. Run `npm run start`.
3. Open the app.
4. Confirm an unauthenticated user lands on `Ingresar`.
5. Create an account with email and password.
6. Confirm the app asks for an access code.
7. Seed demo data if needed.
8. Redeem a demo code.
9. Confirm the driver lands on `Ofertas`.
10. Accept an offered trip.
11. Confirm it appears in `Mis viajes`.
12. Open the trip detail.
13. Confirm demo documents and timeline events are visible.
14. Register an operational event.
15. Open `Cuenta` and sign out.
16. Confirm the app returns to `Ingresar`.

## Included In Phase 2

- Convex Auth email/password sign-in and sign-up
- Authenticated route flow
- Access code activation
- User profile linking to company and driver
- Protected Convex trip, document, and event functions
- Driver offers without sending `driverId` from the frontend
- Account screen with logout
- Temporary demo seed screen with access codes
- Updated demo seeding and cleanup

## Not Included In This Phase

- Real file upload
- GPS
- Push notifications
- Dispatcher web panel
- Marketplace
- Payments
- RNDC integration
- Live tracking
- SMS login
- OAuth with Google or Apple
- Password reset
- Email verification
- Email notifications
- Final production security hardening

## Verification

Before reporting changes as done, run:

```bash
npm install
npx convex dev --once
npm run typecheck
npm run lint
```

For route or visual changes, also open the app through Expo Go, a simulator, or the web preview and walk through the affected flow.

## Suggested Phase 3

Add real document upload with Convex file storage, including driver document submission states and dispatcher review support.
