# Smelt Derby

A web/mobile app for recording and sharing catch counts in real time during smelt (wakasagi) ice-fishing competitions.

Web: https://wakasagi.vercel.app/
iOS(now on testflight): https://testflight.apple.com/join/um9CD1tm

## Features

- **Local mode** — Manage all participants' catches with a single device. Just tap to record each catch
- **Online room mode** — Real-time sharing powered by Supabase. Share the room link with participants so everyone can record their own catches from their own phone or web browser
- **Derby history** — Past results (both local and online) are listed on the home screen
- **Multilingual** — Automatically switches between Japanese and English based on the device locale

## Tech Stack

| Category             | Technology                     |
| -------------------- | ------------------------------ |
| Framework            | React Native + Expo SDK 54     |
| Routing              | Expo Router (file-based)       |
| Language             | TypeScript                     |
| State management     | React Context + TanStack Query |
| Local persistence    | AsyncStorage                   |
| Realtime DB          | Supabase                       |
| Internationalization | i18next + expo-localization    |
| Package manager      | Bun                            |

## Setup

### Prerequisites

- [Node.js](https://github.com/nvm-sh/nvm)
- [Bun](https://bun.sh/docs/installation)

### Install

```bash
git clone <repository-url>
cd smelt-derby
bun install
```

### Environment variables

The online room feature requires a Supabase project. Create a `.env` file in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See `lib/supabase.ts` for the required table schema.

### Start

```bash
# Preview on iOS / Android via Expo Go
bun run start

# Preview in a web browser
bun run start-web
```

After running `bun run start`, press `i` in the terminal to open the iOS Simulator or `a` for the Android Emulator. On a physical device, scan the QR code with the Expo Go app.

## Project Structure

```
├── app/                         # Screens (Expo Router)
│   ├── index.tsx                # Home / setup screen
│   ├── derby.tsx                # Catch recording screen
│   ├── results.tsx              # Results screen (local)
│   ├── room/
│   │   ├── [roomId].tsx         # Online room catch recording screen
│   │   └── [roomId]/results.tsx # Online room results screen
│   └── _layout.tsx              # Root layout
├── components/                  # Shared UI components
├── contexts/
│   └── DerbyContext.tsx         # State management for local mode
├── hooks/
│   ├── useRoomDerby.ts          # Online room logic
│   └── useSessionId.ts          # Session ID management
├── i18n/
│   ├── index.ts                 # i18n initialization
│   └── translations/            # Translation files (ja / en)
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── roomId.ts                # Room ID generation utility
├── types/                       # TypeScript type definitions
├── constants/colors.ts          # Color palette
└── app.json                     # Expo configuration
```

## Build & Release

Use EAS Build to create production builds for the App Store and Google Play.

```bash
# Install EAS CLI
bun add -g @expo/eas-cli

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to the App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

See the [Expo deployment guide](https://docs.expo.dev/deploy/introduction/) for more details.

## Troubleshooting

**Clear the cache and restart**

```bash
bunx expo start --clear
```

**Reinstall dependencies**

```bash
rm -rf node_modules && bun install
```
