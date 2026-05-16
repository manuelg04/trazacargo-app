# AI Agent Guide

## Project

TrazaCargo is an Expo mobile app for Colombian cargo transport companies and truck drivers.
This phase is Android-first commercially, but must stay compatible with Expo Go on iPhone and Android.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- Convex
- Convex Auth
- npm
- Basic React Native components and `StyleSheet`

## Core Commands

```bash
npm install
npx convex dev
npm run start
npm run ios
npm run android
npm run web
npm run typecheck
npm run lint
```

Run `npx convex dev` before relying on generated Convex types.

## Environment

Use `.env.local` for local values and keep it out of git.

Required local values:

```bash
EXPO_PUBLIC_CONVEX_URL=https://scintillating-bulldog-845.convex.cloud
CONVEX_DEPLOYMENT=dev:scintillating-bulldog-845
```

Convex Auth JWT values belong in the Convex deployment environment. Do not add those secrets to `.env.example`.

## App Structure

- `app/`: Expo Router screens and layouts
- `app/(auth)/sign-in.tsx`: email/password sign-in
- `app/(auth)/sign-up.tsx`: account creation
- `app/(onboarding)/access-code.tsx`: access code activation
- `app/(dev)/seed.tsx`: temporary demo seed screen
- `app/(driver)/offers.tsx`: offered trips
- `app/(driver)/trips.tsx`: accepted or assigned trips
- `app/(driver)/account.tsx`: current account and logout
- `app/(driver)/trip/[tripId].tsx`: trip detail, documents, and events
- `src/components/`: reusable UI primitives
- `src/features/`: feature-level UI and state
- `src/constants/`: display constants
- `src/theme/`: colors, spacing, typography
- `src/utils/`: formatting helpers
- `convex/`: schema and backend functions

## Convex

- Schema lives in `convex/schema.ts`.
- Auth config lives in `convex/auth.ts`, `convex/auth.config.ts`, and `convex/http.ts`.
- Auth and permission helpers live in `convex/lib/auth.ts`.
- Current user/profile functions live in `convex/users.ts`.
- Access code functions live in `convex/accessCodes.ts`.
- Demo setup lives in `convex/dev.ts`.
- Driver functions live in `convex/drivers.ts`.
- Trip functions live in `convex/trips.ts`.
- Document functions live in `convex/tripDocuments.ts`.
- Event functions live in `convex/tripEvents.ts`.
- Use generated types from `convex/_generated`.
- Do not hardcode trip data in the frontend.
- Protected driver functions must derive the driver from the authenticated user profile.

Useful Convex calls:

```bash
npx convex run dev:seedDemoData
npx convex run dev:clearDemoData
npx convex run drivers:listDemoDrivers
```

## Product Rules

- Visible UI text must be in Spanish.
- File names, function names, type names, and variables must be in English.
- Keep Expo Go compatibility.
- Do not add native modules that require prebuild or a development build.
- Do not add Supabase or Firebase in this phase.
- Do not add NativeWind, Tamagui, or heavy UI kits.
- Do not implement real GPS, push notifications, real file upload, or a web panel unless explicitly requested.

## Coding Rules

- Use TypeScript strictly.
- Use npm only unless an existing lockfile says otherwise.
- Do not write code comments.
- Do not leave placeholders, unfinished stubs, or omitted-code notes.
- Keep components small and split screens when they grow.
- Keep formatting logic in `src/utils`.
- Keep presentation constants in `src/constants`.
- Keep theme values in `src/theme`.
- Avoid `any`.
- Do not send `driverId` from frontend protected trip, document, or event calls.

## Design Rules

- Use simple, professional mobile UI.
- Use large touch targets and clear cards.
- Use React Native `StyleSheet`.
- Keep the app useful for a driver on the road.
- Avoid maps, charts, and complex animations for now.

## Verification

Before reporting work as done, run:

```bash
npm install
npx convex dev --once
npm run typecheck
npm run lint
```

For visual or navigation changes, run the app and check the affected flow in Expo Go, simulator, or web preview.

## Git

- Never mention Codex as a co-author in commit messages.
- Keep commit messages short and direct.
- Do not commit `.env.local`.
