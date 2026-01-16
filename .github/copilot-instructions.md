# Couple Calendar AI Instructions

This repository is a lightweight Expo (React Native) application designed to sync events to Google Calendars for a couple, using a "No-Auth" approach via Google Apps Script.

## Architecture & Integration

- **Frontend**: Built with Expo and `expo-router` using file-based routing.
- **Backend (No-Auth Flow)**: The app bypasses OAuth by using a **Google Apps Script Web App** as a proxy.
  - **Mechanism**: The app sends a `POST` request to the script URL (stored in `EXPO_PUBLIC_SCRIPT_URL`).
  - **Payload Structure**:
    ```json
    {
      "title": "Date Night",
      "description": "Dinner at 7",
      "start": "2026-01-16T19:00:00.000Z",
      "end": "2026-01-16T21:00:00.000Z"
    }
    ```
  - **Permissions**: The script must be deployed with **Execute as: Me** and **Who has access: Anyone**. This allows the app to create events on the user's calendar without an additional login screen.

## Google Apps Script Logic

The script (deployed as a Web App) behaves as follows:

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  // Shared Calendar ID
  var calendar = CalendarApp.getCalendarById("46dbc842685af34b7d53367ba892d060ac0353abb50243a3443c65e9f1792f93@group.calendar.google.com");

  // Creates event on the shared calendar
  calendar.createEvent(data.title, new Date(data.start), new Date(data.end), {
    description: data.description,
  });

  return ContentService.createTextOutput("Success");
}
```

- **`doPost(e)`**: Entry point for the mobile app's `fetch` call.
- **Shared Calendar**: Uses `getCalendarById` with the specific ID to provide equal access to both users.
- **Security**: Relies on the obfuscated Script URL. No other authentication is implemented.

## Project Conventions

- **Routing**: Follow `expo-router` conventions. The main entry point is `app/(tabs)/index.tsx`.
- **Styling**:
  - Use themed components: `ThemedText` and `ThemedView` from `components/`.
  - Reference colors from [constants/theme.ts](constants/theme.ts) using the `useThemeColor` hook.
  - Avoid hardcoding hex colors unless necessary.
- **Environment Variables**: Always prefix client-side variables with `EXPO_PUBLIC_` to ensure they are bundled by Expo.
- **Components**:
  - Generic UI components should go into `components/ui/`.
  - Feature-specific components stay in `components/`.

## Critical Workflows

- **Development**: Run `npx expo start` to test in Expo Go or an emulator.
- **Direct Redirects**: Currently disabled in favor of the Apps Script approach. Do not re-enable OAuth unless explicitly asked.
- **Adding Dependencies**: Use `npx expo install` to ensure compatibility with the current Expo SDK version.

## Key Files

- [package.json](package.json): Project dependencies and Expo SDK version (~54.0.31).
- [app.json](app.json): Expo configuration, including the `scheme` (`couplecalendar`) and `package` name.
- [.env](.env): Local environment variables (not committed to git).
- [plan.md](plan.md): The implementation roadmap for the project.
