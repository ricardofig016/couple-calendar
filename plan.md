# Implementation Plan: Couple Calendar App

This plan outlines the steps to build a simple Android/cross-platform app using **Expo (React Native)** to schedule events directly to both your and your girlfriend's Google Calendars without a backend.

## 1. Prerequisites (done)

- [Node.js](https://nodejs.org/) installed.
- [Expo Go](https://expo.dev/go) app installed on both your and your girlfriend's Android phones.
- A Google Cloud account.

## 2. Step 1: Initialize the Project

Create a new Expo project in the current directory.

```bash
npx create-expo-app@latest .
```

## 3. Step 2: Google Cloud Console Setup

You need to register your app with Google to use their APIs.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `CoupleCalendar`.
3. **Enable APIs**: Search for and enable the **Google Calendar API**.
4. **OAuth Consent Screen**:
   - Choose "External" (or "Internal" if you have a Google Workspace).
   - Add the scope: `https://www.googleapis.com/auth/calendar.events`.
   - Add your and your girlfriend's emails as "Test users".
5. **Credentials**:
   - Create an **OAuth 2.0 Client ID** for "Android".
   - You will also likely need a "Web" client ID for Expo's proxy debugging.
   - Note down the **Client IDs**.

## 4. Step 3: Install Dependencies

Install the necessary libraries for authentication and API requests.

```bash
npx expo install expo-auth-session expo-crypto expo-web-browser
```

## 5. Step 4: Authentication (Sign-In with Google)

Implement the OAuth2 flow using `expo-auth-session`.

- The app will prompt you to log in.
- Store the `accessToken` returned by Google.

## 6. Step 5: Build the Form UI

Create a simple screen with:

- `TextInput` for the **Title/Description**.
- A Date/Time picker (using `@react-native-community/datetimepicker`).
- A "Submit" button.

## 7. Step 6: Integrate Google Calendar API

When the "Submit" button is pressed:

1. Construct the event object:
   ```json
   {
     "summary": "Event Title",
     "description": "Event Description",
     "start": { "dateTime": "2023-10-27T10:00:00Z" },
     "end": { "dateTime": "2023-10-27T11:00:00Z" },
     "attendees": [{ "email": "your-girlfriend@gmail.com" }]
   }
   ```
2. Send a `POST` request to `https://www.googleapis.com/calendar/v3/calendars/primary/events`.
3. Use the `accessToken` in the `Authorization` header.

_Note: By adding her as an attendee, Google will automatically send an invite and add it to her calendar (depending on her settings)._

## 8. Step 7: Local Testing

1. Run `npx expo start`.
2. Scan the QR code with the **Expo Go** app on your phone.
3. Test the login and event creation.

## 9. Step 8: Deployment (The "Super Simple" Way)

Since this is just for two people, you don't necessarily need to publish to the Play Store.

- You can keep using **Expo Go**.
- Alternatively, you can use **EAS Build** to create a standalone `.apk` for Android and install it directly on your phones.
  ```bash
  npx eas-build --platform android --profile preview
  ```
