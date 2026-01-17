# Couple Calendar AI Instructions

This repository is a lightweight Expo (React Native) application designed to sync events to Google Calendars for a couple, using a "No-Auth" approach via Google Apps Script.

## Architecture & Integration

- **Frontend**: Built with Expo and `expo-router` using file-based routing.
- **State Management**: Complex business logic should be extracted into custom hooks (e.g., `useEventForm`). Use `useLocalSearchParams` for passing data between screens (e.g., editing from `manage.tsx` to `index.tsx`).
- **Shared Components**: Extract UI fragments into the [components/](components/) directory to keep screen files focused on layout.
- **Backend (No-Auth Flow)**: The app bypasses OAuth by using a **Google Apps Script Web App** as a proxy.
  - **Mechanism**: The app sends a `POST` request to the script URL (stored in `EXPO_PUBLIC_SCRIPT_URL`).
  - **Payload Structure**:
    ```json
    {
      "action": "create" | "edit" | "delete",
      "id": "event_id", // For edit/delete
      "title": "Date Night",
      "description": "Dinner at 7",
      "start": "2026-01-16T19:00:00Z",
      "end": "2026-01-16T21:00:00Z"
    }
    ```
  - **Listing**: A `GET` request to the same URL returns a JSON array of events.
- **Permissions**: The script must be deployed with **Execute as: Me** and **Who has access: Anyone**.

## Preset System & Dynamic Logic

The app uses a class-based preset system in [utils/preset.ts](utils/preset.ts) to handle template resolution.

### Preset Classes

- `Preset`: Base class for templates.
- `resolve(description)`: Resolves placeholders like `[A]`, `[B]`, `[KEY]`, and `[KEY: options]`.
- `resolveTitle(title, startTime)`: Overridable for time-based naming (e.g., changing "Dinner" to "Breakfast" based on `startTime`). See `DinnerPreset` for implementation.

### Placeholder Patterns

- `[A]` and `[B]`: Linked couple (one is Ricardo, the other is Carolina).
- `[KEY]`: Picks one of the two names randomly.
- `[KEY: option1, option2]`: Picks one selection and lists the others as "Better luck next time".

### Rich Text Formatting

Google Calendar descriptions support specific HTML tags. **Always use these for formatting**:
`<b>Bold</b>`, `<i>Italics</i>`, `<u>Underline</u>`, `<a href="...">Link</a>`, `\n` for newlines.
When displaying in the UI, use `.replace(/<[^>]*>?/gm, "")` to strip them if needed.

## UI & Styling Conventions

- Always use `ThemedText` and `ThemedView` from [components/](components/).
- Fetch colors via `useThemeColor` hook: `const color = useThemeColor({}, 'text');`.
- Avoid hardcoding colors; use `Colors` from [constants/theme.ts](constants/theme.ts).
- Fonts are centrally managed in [constants/theme.ts](constants/theme.ts). Use `Fonts.rounded` for a friendly, modern look on supported platforms.
- **Icons**: Use the [components/ui/icon-symbol.tsx](components/ui/icon-symbol.tsx) component. It maps iOS SF Symbols to Android Material Icons. Add new mappings to its `MAPPING` constant.

## Date/Time Handling

- Use `@react-native-community/datetimepicker` for selection.
- Extract modals into separate components like [components/date-time-picker-modals.tsx](components/date-time-picker-modals.tsx).
- UI displays use `en-GB` locale: `date.toLocaleDateString("en-GB")`.
- Payload must be ISO strings (`toISOString()`).

## Key Workflows

- **Dev**: `npx expo start`
- **Build**: `npx eas build --platform android --profile preview` (requires `eas.json` env config).
- **Backend Update**: Modify the Google Apps Script and re-deploy as a new version.
