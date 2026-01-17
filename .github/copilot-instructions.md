# Couple Calendar AI Instructions

This repository is a lightweight Expo (React Native) application designed to sync events to Google Calendars for a couple, using a "No-Auth" approach via Google Apps Script.

## Architecture & Integration

- **Frontend**: Built with Expo and `expo-router` using file-based routing.
- **Backend (No-Auth Flow)**: Bypasses OAuth by using a **Google Apps Script Web App** as a proxy.
  - **Mechanism**: All calendar interactions (create/edit/delete) are via `POST` to `EXPO_PUBLIC_SCRIPT_URL`.
  - **Listing**: Fetching via `GET` to the same URL returns a JSON array of `CalendarEvent`.
- **Global State Management**:
  - **EventContext**: Managed in [context/event-context.tsx](context/event-context.tsx). Always use the `useEvents()` hook to access the global event list and `refreshEvents()` function.
  - **Refresh Pattern**: When performing mutations (e.g., in `useEventForm.ts` or `manage.tsx`), always call `refreshEvents(false)` after a successful backend response to keep the UI in sync without a full-screen loader.
- **Navigation**: Complex business logic should be extracted into custom hooks (e.g., `useEventForm`). Use `useLocalSearchParams` for passing event data between screens (e.g., editing from `manage.tsx` to `index.tsx`).

## Preset System & Dynamic Logic

The app uses a class-based preset system in [utils/preset.ts](utils/preset.ts) to handle template resolution.

### Preset Classes & Placeholders

- `Preset`: Base class for templates. `resolve(description)` handles placeholders:
  - `[A]` and `[B]`: Linked couple (one is Ricardo, the other is Carolina).
  - `[KEY]`: Picks one of the two names randomly.
  - `[KEY: option1, option2]`: Picks one selection and lists the others as "Better luck next time".
- `resolveTitle(title, startTime)`: Overridable for time-based naming (e.g., changing "Dinner" to "Breakfast" based on `startTime`). See `DinnerPreset` for implementation.

### Rich Text Formatting

Google Calendar descriptions support specific HTML tags: `<b>Bold</b>`, `<i>Italics</i>`, `<u>Underline</u>`, `<a href="...">Link</a>`, `\n`.
**Strip them** with `.replace(/<[^>]*>?/gm, "")` when displaying in plain text UI components.

## UI & Styling Conventions

- Always use `ThemedText` and `ThemedView` from [components/](components/).
- Fetch colors via `useThemeColor` hook and reference `Colors` and `Fonts` from [constants/theme.ts](constants/theme.ts). Use `Fonts.rounded`.
- **Icons**: Use the [components/ui/icon-symbol.tsx](components/ui/icon-symbol.tsx) component. It maps iOS SF Symbols to Android Material Icons.

## Date/Time Handling

- Use `@react-native-community/datetimepicker` extracted into [components/date-time-picker-modals.tsx](components/date-time-picker-modals.tsx).
- UI displays use `en-GB` locale: `date.toLocaleDateString("en-GB")`.
- Payload must be ISO strings (`toISOString()`).

## Key Workflows

- **Dev**: `npx expo start`
- **Build**: `npx eas build --platform android --profile preview` (requires `eas.json` env config).
- **Backend Update**: Modify the Google Apps Script (see logic in `README.md`) and re-deploy as a new version. Ensure "Who has access" is set to "Anyone".
