# Couple Calendar AI Instructions

This repository is a lightweight Expo (React Native) application designed to sync events to Google Calendars for a couple, using a "No-Auth" approach via Google Apps Script.

## Architecture & Integration

- **Frontend**: Built with Expo and `expo-router` using file-based routing.
- **Backend (No-Auth Flow)**: Bypasses OAuth by using a **Google Apps Script Web App** as a proxy.
  - **Mechanism**: All calendar interactions (create/edit/delete) are via `POST` to `EXPO_PUBLIC_SCRIPT_URL`.
  - **Listing**: Fetching via `GET` to the same URL returns a JSON array of `CalendarEvent`.
- **Global State Management**:
  - **EventContext**: Managed in [context/event-context.tsx](context/event-context.tsx). Access via `useEvents()` hook.
  - **Refresh Pattern**: Always call `refreshEvents(false)` after mutations (e.g., in `use-event-form.ts` or `manage.tsx`) to keep the UI in sync without full-screen loaders.
- **Form Logic**: Extracted in [hooks/use-event-form.ts](hooks/use-event-form.ts). It handles title resolution, date/time calculations, and "All Day" logic (adjusting hours to `00:00` - `23:59`).

## Preset System & Dynamic Logic

Located in [utils/preset.ts](utils/preset.ts).

### Preset Constants & Placeholders

- `Preset.NAMES`: Static array `["Ricardo", "Carolina"]` used for name resolution.
- `[A]` and `[B]`: Linked couple (one is `NAMES[0]`, other is `NAMES[1]`).
- `[KEY]`: Randomly picks one of the names.
- `[KEY: option1, option2]`: Selects one and lists others as "Better luck next time".

### Specialized Presets

- `DinnerPreset`:
  - Overrides `resolveTitle` to change "Dinner" to "Breakfast"/"Lunch"/"Snack" based on time.
  - Map `FOOD_EMOJIS` prepends icons (e.g., 🍕, 🍣) to "What to eat" if a matching keyword is found in descriptions.

## UI & Styling Conventions

- **Components**: Use `ThemedText` and `ThemedView` from [components/](components/).
- **Theming**: Use `useThemeColor()` and `Fonts.rounded` from [constants/theme.ts](constants/theme.ts).
- **Icons**: Use [components/ui/icon-symbol.tsx](components/ui/icon-symbol.tsx) (maps SF Symbols to Material Icons).
- **Rich Text**: Google Calendar supports basic HTML (`<b>`, `<i>`, etc.). **Strip them** using `.replace(/<[^>]*>?/gm, "")` when displaying in plain text UI.
- **Date Display**: Use the `getEventDateText(event)` helper in [app/(tabs)/manage.tsx](app/%28tabs%29/manage.tsx) for smart formatting of multi-day and all-day events.

## Key Workflows

- **Dev**: `npx expo start`
- **Build**: `npx eas build --platform android --profile preview` (env vars in `eas.json`).
- **Date Selection**: Uses `@react-native-community/datetimepicker` via [components/date-time-picker-modals.tsx](components/date-time-picker-modals.tsx). Display locale is `en-GB`.
