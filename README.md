# TrazaCargo

TrazaCargo is a mobile app foundation for cargo transport companies and truck drivers in Colombia. This phase builds the first working driver flow with demo data in Convex.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- Convex
- npm

## Install

```bash
npm install
```

## Environment

Create `.env.local` from `.env.example` and set the Convex URL:

```bash
EXPO_PUBLIC_CONVEX_URL=https://scintillating-bulldog-845.convex.cloud
CONVEX_DEPLOYMENT=dev:scintillating-bulldog-845
```

## Run Convex

```bash
npx convex dev
```

Keep this running while you work. It syncs the backend functions and keeps generated types updated.

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

## Test on iPhone with Expo Go

1. Install Expo Go on the iPhone.
2. Run `npm run start`.
3. Scan the QR code shown by Expo.
4. Make sure the phone and computer are on the same network.
5. If the network blocks local connections, switch Expo to tunnel mode from the terminal menu.

## Demo Data

Open the app, go to the temporary driver selection screen, and press `Crear datos demo`.

The demo seed creates:

- One demo company in Bucaramanga
- Two active drivers
- One active vehicle
- Three demo trips
- Trip offers for the demo drivers
- Demo documents for each trip
- An initial accepted event for one trip

You can remove only this demo data with `Borrar datos demo`.

## Included In This Phase

- Temporary driver selection
- Convex schema and backend functions
- Driver offer list
- Accept trip flow
- Accepted trip list
- Trip detail screen
- Demo documents
- Operational event registration
- Reactive updates from Convex

## Not Included In This Phase

- Real authentication
- Real file upload
- GPS capture
- Push notifications
- Dispatcher web panel
- Production document management
- Role permissions

## Suggested Phase 2

- Add real authentication and company membership
- Add dispatcher assignment rules
- Add document upload with Convex file storage
- Add event-level GPS capture
- Add notification triggers for dispatchers and drivers
- Add a web panel for dispatchers
