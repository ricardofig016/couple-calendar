# Couple Calendar AI Instructions

This repository is a lightweight Expo (React Native) application designed to sync events to Google Calendars for a couple, using a "No-Auth" approach via Google Apps Script.

## Architecture & Integration

- **Frontend**: Built with Expo and `expo-router` using file-based routing. Main logic for event creation is in [app/(tabs)/index.tsx](<app/(tabs)/index.tsx>).
- **Backend (No-Auth Flow)**: The app bypasses OAuth by using a **Google Apps Script Web App** as a proxy.
  - **Mechanism**: The app sends a `POST` request to the script URL (stored in `EXPO_PUBLIC_SCRIPT_URL`).
  - **Payload Structure**:
    ```json
    { "title": "Date Night", "description": "Dinner at 7", "start": "2026-01-16T19:00:00Z", "end": "2026-01-16T21:00:00Z" }
    ```
- **Permissions**: The script must be deployed with **Execute as: Me** and **Who has access: Anyone**.

## Preset System & Dynamic Logic

The app uses a class-based preset system in [utils/preset.ts](utils/preset.ts) to handle template resolution.

### Preset Classes

- `Preset`: Base class for templates.
- `resolve(description)`: Resolves placeholders like `[A]`, `[B]`, `[KEY]`, and `[KEY: options]`.
- `resolveTitle(title, startTime)`: Overridable for time-based naming (e.g., changing "Dinner" to "Breakfast" based on `startTime`).

### Placeholder Patterns

- `[A]` and `[B]`: Linked couple (one is Ricardo, the other is Carolina).
- `[KEY]`: Picks one of the two names randomly.
- `[KEY: option1, option2]`: Picks one selection and lists the others as "Better luck next time".

### Rich Text Formatting

Google Calendar descriptions support specific HTML tags. **Always use these for formatting**:
`<b>Bold</b>`, `<i>Italics</i>`, `<u>Underline</u>`, `<a href="...">Link</a>`, `\n` for newlines.

## Project Conventions

- **Routing**: Follow `expo-router` conventions. Tabs are in `app/(tabs)/`.
- **Styling**:
  - Always use `ThemedText` and `ThemedView` from `components/`.
  - Fetch colors via `useThemeColor` hook: `const color = useThemeColor({}, 'text');`.
  - Avoid hardcoding colors; use `Colors` from [constants/theme.ts](constants/theme.ts).
- **Date/Time**:
  - Handled via `@react-native-community/datetimepicker`.
  - UI displays use `en-GB` locale: `date.toLocaleDateString("en-GB")`.
  - Payload must be ISO strings (`toISOString()`).

## Key Workflows

- **Dev**: `npx expo start`
- **Build**: `npx eas build --platform android --profile preview` (requires `eas.json` env config).
