# Couple Calendar

A lightweight Expo (React Native) application designed to seamlessly sync events to Google Calendars for a couple. This app eliminates the complexity of OAuth by using a Google Apps Script proxy, making it perfect for personal use.

## Features

- **No-Auth Architecture**: Bypasses OAuth sign-ins. Your app acts as you to manage calendars.
- **Multi-Calendar Support**: Select and sync multiple Google Calendars; all events merged and displayed together.
- **Event Presets**: One-tap templates (Dinner, Movies, Gym, etc.) with dynamic logic.
- **Dynamic Placeholders**:
  - `[A]` / `[B]`: Assign couple members to opposite sides (who's paying, who's driving, etc.).
  - `[KEY]`: Single random person (e.g., `[PICKER]`).
  - `[KEY: option1, option2]`: App picks one and lists the rest as "losers" (e.g., `[FOOD: Sushi, Pizza]`).
- **Smart Titles**: Dinner preset auto-shifts to Breakfast, Lunch, or Snack based on time.
- **Flexible Scheduling**: Single-day, multi-day, and all-day events.
- **Light & Dark Mode**: Full theme support.

## Technical Stack

- **Frontend**: [Expo](https://expo.dev/) (React Native) with [Expo Router](https://docs.expo.dev/router/introduction/)
- **Backend**: [Google Apps Script](https://www.google.com/script/start/) Web App (no OAuth)
- **Storage**: AsyncStorage for calendar selections, event range, and deployment ID

## Setup Instructions

### 1. Google Apps Script Setup (The "Backend")

1. Go to [script.google.com](https://script.google.com) and create a new project.
2. Replace the default code with the backend script from [scripts/apps-script-backend.js](scripts/apps-script-backend.js). This handles:
   - `action=listCalendars` - return all user calendars
   - `action=getEvents&calendarId=X&daysBack=N&daysForward=M` - fetch events with configurable range
   - `action=create/edit/delete` - manage events across multiple calendars
3. Click **Deploy** > **New Deployment**.
4. Select **Web App**. Set **Execute as: Me** and **Who has access: Anyone**.
5. Copy the **Deployment ID** from the URL (format: `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec`). You'll need just the `<DEPLOYMENT_ID>` part.

### 2. App Configuration

1. Open the app and go to **Settings** > **Backend**.
2. Paste your **Deployment ID** (the app will construct the full URL).
3. Tap **Refresh** under Calendars to load all available calendars from your Google Account.
4. Select the calendars to sync and set the **Event Range** (how many days back and forward to fetch).

### 3. Installation & Running

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

## Android APK Build

1. Install EAS CLI: `npm install -g eas-cli`
2. Run the build:

   ```bash
   npx eas build --platform android --profile preview
   ```

3. Download the APK and install it on your device (no deployment ID needed at build time).

## Customizing Presets

Edit [utils/preset.ts](utils/preset.ts) to add or modify presets. See the structure for examples of how to:

- Define titles, descriptions, and default times
- Use placeholder resolution for couple names and options
- Add custom logic (e.g., `DinnerPreset` shifts meal name by time)

---

Built with ❤️ for Ricardo & Carolina.
