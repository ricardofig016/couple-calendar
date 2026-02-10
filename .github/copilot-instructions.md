# Couple Calendar AI Instructions

A lightweight Expo (React Native) app syncing couple events to Google Calendar via a "No-Auth" Google Apps Script proxy, featuring dynamic event presets with randomized logic.

## Architecture & Data Flow

- **"No-Auth" Proxy**: Google Apps Script Web App bypasses OAuth. `EXPO_PUBLIC_SCRIPT_URL` env var points to deployed script.
  - **GET**: Returns `CalendarEvent[]` for events 2 days past to 90 days future.
  - **POST**: Accepts `{ action, id, title, description, start, end }` for create/edit/delete operations.
- **Global State**: [EventProvider](context/event-context.tsx) manages events and refresh. After mutations, call `refreshEvents(false)` for silent background reload (no spinner).
- **Routing**: [expo-router](https://docs.expo.dev/router/introduction/). Form edits navigate via params: `/` accepts `id, title, description, start, end` for pre-population. After submit, params cleared.

## Preset & Logic Engine

- **System**: [utils/preset.ts](utils/preset.ts) resolves regex placeholders **client-side before persisting**:
  - `[A]` / `[B]`: Linked couple — assigned opposite names with 50/50 random pick.
  - `[KEY]`: Single random person name (e.g., `[PAYER]`).
  - `[KEY: option1, option2]`: Selects one, lists others as "losers" below (e.g., `[FOOD: Sushi, Pizza]`).
  - `[KEY: value]`: Field extraction from description (used in `DinnerPreset` for emoji lookup).
- **Critical**: `useEventForm.handleSubmit()` calls `preset.resolveTitle()` + `preset.resolve()` BEFORE posting. Resolved text contains `<b>` tags (for bold).
- **DinnerPreset** extends Preset with time-based meal shifting: 5–10:30 = Breakfast, 10:30–15 = Lunch, 15–18:30 = Snack, else = Dinner. Returns emoji for matched foods if found in `FOOD_EMOJIS` map.

## Form & Date Handling

- [useEventForm](hooks/use-event-form.ts) manages single/multi-day event state:
  - **Single-day**: `date`, `startTime`, `endTime` (3 separate state vars).
  - **Multi-day**: `multiStartDate`, `multiEndDate` (each includes both date & time).
  - **All Day**: Set as `00:00` to `23:59` (single-day) or `00:00` start to `23:59` end (multi-day).
  - **Edit flow**: Nav params populate form; `clearForm()` resets state and params.

## UI Patterns & Display

- **Theming**: Use `ThemedText`, `ThemedView` from [components/](components/). Colors via `useThemeColor()` hook (`text`, `background`, `icon`, `tint`, `danger`, `border`, `success`).
- **Typography**: `Fonts.rounded` from [constants/theme.ts](constants/theme.ts) for headings; semantic types in ThemedText (`title`, `default`, `defaultSemiBold`).
- **Icons**: [icon-symbol.tsx](components/ui/icon-symbol.tsx) maps SF Symbols (iOS); other platforms need mappings in `MAPPING` constant.
- **HTML Stripping**: Display removes `<b>` tags from descriptions: `.replace(/<[^>]*>?/gm, "")`.

## Google Apps Script Backend Setup

The backend is a Google Apps Script Web App that acts as the "No-Auth" proxy to Google Calendar. This **must be deployed first**.

**One-time setup:**

1. Go to [script.google.com](https://script.google.com) → New Project.
2. Replace `<YOUR_CALENDAR_ID>` with the shared calendar ID (format: `xyz@group.calendar.google.com`).
3. Use the provided `doGet()` and `doPost()` functions from the README.
4. Click **Deploy** → **New Deployment** → **Web App** with **Execute as: Me**, **Who has access: Anyone**.
5. Copy the Web App URL (format: `https://script.google.com/macros/s/<SCRIPT_ID>/exec`).

**Key behaviors:**

- `doGet()`: Returns events from 2 days past to 90 days future as `CalendarEvent[]`.
- `doPost()`: Handles `{ action: 'create'|'edit'|'delete', id, title, description, start, end }`.
- **Error Debug Tip**: If EventProvider gets HTML instead of JSON, it means the script isn't deployed or returns an error page. Check deployment settings and calendar ID.

## Development & Deployment

- **Local**: `npx expo start` → choose web/iOS/Android.
- **Android APK**: `eas build --platform android --profile preview` (env vars in `eas.json`, not `.env`).
- **Linting**: `npm run lint` (expo-lint).
- **Environment**:
  - **Dev**: Set `EXPO_PUBLIC_SCRIPT_URL` in `.env`.
  - **Builds**: Define in `eas.json` under the profile's `env` section (EAS uses `eas.json`, not `.env`).
