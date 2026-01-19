# Couple Calendar AI Instructions

This repository is a lightweight Expo (React Native) application designed to sync events to Google Calendars for a couple, using a "No-Auth" approach via Google Apps Script.

## Architecture & Integration

- **"No-Auth" Proxy**: Uses a **Google Apps Script Web App** (URL in `EXPO_PUBLIC_SCRIPT_URL`) to bypass OAuth.
  - **Fetching**: `GET` to the script URL returning `CalendarEvent[]`.
  - **Mutations**: `POST` to the script URL with `{ action: 'create' | 'edit' | 'delete', id, title, description, start, end }`.
- **Global State**: Managed by `EventProvider` in [context/event-context.tsx](context/event-context.tsx).
  - **Refresh Pattern**: Always call `refreshEvents(false)` after mutations for background UI updates without showing a global spinner.

## Preset & Logic System

- **Logic Engine**: Defined in [utils/preset.ts](utils/preset.ts) using regex-based placeholders.
  - **Placeholders**: `[A]` and `[B]` (linked couple), `[KEY]` (random name), `[KEY: item1, item2]` (choice with "losers").
  - **Resolution**: `useEventForm` MUST call `preset.resolveTitle()` and `preset.resolve()` before sending data to the backend to persist resolved choices.
- **Smart Titles**: `DinnerPreset` dynamically shifts titles (Dinner -> Breakfast/Lunch/Snack) based on the `startTime`.

## UI & Component Patterns

- **Themed Components**: Use `ThemedText` and `ThemedView` from [components/](components/).
- **Colors & Typography**: Use `useThemeColor()` for semantic colors and `Fonts.rounded` from [constants/theme.ts](constants/theme.ts) for headings.
- **Icon Strategy**: Use [components/ui/icon-symbol.tsx](components/ui/icon-symbol.tsx). It uses SF Symbols on iOS; non-Apple platforms require adding mappings to the `MAPPING` constant.
- **HTML in Text**: The backend may return `<b>` tags. Strip them in UI using `.replace(/<[^>]*>?/gm, "")` (see [app/(tabs)/manage.tsx](app/%28tabs%29/manage.tsx)).
- **Date Formatting**: Follow the `getEventDateText` pattern in [app/(tabs)/manage.tsx](app/%28tabs%29/manage.tsx) for consistent date/time ranges.

## Workflows & State Logic

- **Event Forms**: [hooks/use-event-form.ts](hooks/use-event-form.ts) handles all date/time and "All Day" logic.
  - **"All Day" Pattern**: Represented as `00:00` to `23:59`.
- **Navigation**: Uses `expo-router`. Params are passed to `index.tsx` for editing existing events.
- **Dev Commands**:
  - `npx expo start` for local development.
  - `npx eas build --platform android --profile preview` for APK builds. Env vars must be defined in `eas.json`.
