# Couple Calendar AI Instructions

This repository is a lightweight Expo (React Native) application designed to sync events to Google Calendars for a couple, using a "No-Auth" approach via Google Apps Script.

## Architecture & Integration

- **"No-Auth" Proxy**: Uses a **Google Apps Script Web App** to bypass OAuth.
  - **Fetching**: `GET` to `EXPO_PUBLIC_SCRIPT_URL` returning `CalendarEvent[]`.
  - **Mutations**: `POST` to `EXPO_PUBLIC_SCRIPT_URL` with `{ action: 'create' | 'edit' | 'delete', ... }`.
- **Global State**: `EventContext` in [context/event-context.tsx](context/event-context.tsx).
  - **Refresh Pattern**: Always call `refreshEvents(false)` after mutations (e.g., in `use-event-form.ts`) for background UI updates.

## Preset System

Defined in [utils/preset.ts](utils/preset.ts).

- **Placeholders**: `[A]` and `[B]` (linked couple), `[KEY]` (random name), `[KEY: item1, item2]` (choice with "losers").
- **Resolution**: `useEventForm` calls `preset.resolveTitle()` and `preset.resolve()` before sending to backend.
- **Example**: `DinnerPreset` dynamically shifts from "Dinner" to "Breakfast/Lunch" based on `startTime`.

## UI & Scaling

- **Components**: Use `ThemedText` and `ThemedView` from [components/](components/).
- **Theming**: Use `useThemeColor()` and `Fonts.rounded` from [constants/theme.ts](constants/theme.ts).
- **Icons**: Use [components/ui/icon-symbol.tsx](components/ui/icon-symbol.tsx). SF Symbols must be mapped to Material Icons in the `MAPPING` constant.
- **HTML Handling**: Backend supports `<b>`. Strip it in UI with `.replace(/<[^>]*>?/gm, "")`.
- **Date Formatting**: Use `getEventDateText` in [app/(tabs)/manage.tsx](app/%28tabs%29/manage.tsx).

## Workflows

- **Dev**: `npx expo start`
- **Build**: `npx eas build --platform android --profile preview`. Env vars like `EXPO_PUBLIC_SCRIPT_URL` must be in `eas.json`.
- **Forms**: [hooks/use-event-form.ts](hooks/use-event-form.ts) handles all date/time and "All Day" (`00:00`-`23:59`) logic.
