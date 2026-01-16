# Couple Calendar AI Instructions

This repository is a lightweight Expo (React Native) application designed to sync events to Google Calendars for a couple, using a "No-Auth" approach via Google Apps Script.

## Architecture & Integration

- **Frontend**: Built with Expo and `expo-router` using file-based routing.
- **Backend (No-Auth Flow)**: The app bypasses OAuth by using a **Google Apps Script Web App** as a proxy.
  - **Mechanism**: The app sends a `POST` request to the script URL (stored in `EXPO_PUBLIC_SCRIPT_URL`).
  - **Payload Structure**:
    ```json
    { "title": "Date Night", "description": "Dinner at 7", "start": "2026-01-16T19:00:00Z", "end": "2026-01-16T21:00:00Z" }
    ```
  - **Permissions**: The script must be deployed with **Execute as: Me** and **Who has access: Anyone**.

## Preset System & Dynamic Descriptions

The app uses a preset system defined in [utils/preset.ts](utils/preset.ts) to simplify event creation.

- **Classes**: Every preset extends `Preset`. Use `StandardPreset` for static content or create a class (e.g., `MoviePreset`) for dynamic logic.
- **Logic Resolution**: The `resolve(description)` method handles transformations before sending to the backend. Use this for RNG or placeholder replacement.
- **Rich Text**: Google Calendar descriptions support a limited subset of **HTML tags**. Always use these for formatting:
  - `<b>Bold Text</b>`, `<i>Italics</i>`, `<u>Underline</u>`, `<a href="...">Link</a>`.
- **Example Pattern**:
  ```typescript
  // Replacing a placeholder [RNG] with dynamic content in utils/preset.ts
  override resolve(current: string): string {
    return current.replace("[RNG]", Math.random() > 0.5 ? "<b>Ricardo</b>" : "<b>Carolina</b>");
  }
  ```

## Project Conventions

- **Routing**: Main UI is in [app/(tabs)/index.tsx](<app/(tabs)/index.tsx>). Follow `expo-router` conventions.
- **Styling**:
  - Always use `ThemedText` and `ThemedView` from `components/`.
  - Fetch colors via `useThemeColor` hook from [hooks/use-theme-color.ts](hooks/use-theme-color.ts).
  - Avoid hardcoding hex colors; reference [constants/theme.ts](constants/theme.ts).
- **Date/Time**: Handled via `@react-native-community/datetimepicker`. Combine dates and times manually before converting to ISO strings.

## Critical Workflows

- **Development**: Run `npx expo start`.
- **Environment**: Client-side variables must be prefixed with `EXPO_PUBLIC_`.
- **Dependencies**: Use `npx expo install` for compatibility.

## Key Files

- [app/(tabs)/index.tsx](<app/(tabs)/index.tsx>): Primary event creation form.
- [utils/preset.ts](utils/preset.ts): Definition of all available event templates and logic.
- [constants/theme.ts](constants/theme.ts): Source of truth for light/dark mode colors.
- [package.json](package.json): Expo SDK and project metadata.
