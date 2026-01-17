# Couple Calendar

A lightweight Expo (React Native) application designed to seamlessly sync events to Google Calendars for a couple. This app eliminates the complexity of OAuth by using a **Google Apps Script** proxy, making it perfect for personal use.

## Features

- **No-Auth Architecture**: Bypasses complex OAuth sign-ins. Your app acts as you (the developer) to manage your calendar.
- **Event Presets**: One-tap templates for common dates (Dinner, Movies, Gym, etc.).
- **Dynamic Logic**:
  - **RNG Decision Maker**: Use placeholders like `[FOOD: Sushi, Pizza]` in descriptions to let the app pick for you.
  - **The Person Roulette**: Randomly assigns who is paying or doing chores using `[A]` and `[B]` tags.
  - **Smart Titles**: The Dinner preset automatically changes its name to Breakfast, Lunch, or Snack based on the selected time.
- **Flexible Scheduling**: Supports single-day timeslots and multi-day events.
- **Themed UI**: Full support for system-wide Light and Dark modes.

## Technical Stack

- **Frontend**: [Expo](https://expo.dev/) (React Native) with [Expo Router](https://docs.expo.dev/router/introduction/).
- **Backend**: [Google Apps Script](https://www.google.com/script/start/) deployed as a Web App.
- **Styling**: Themed components using CSS-in-JS.

## Setup Instructions

### 1. Google Apps Script Setup (The "Backend")

1. Go to [script.google.com](https://script.google.com) and create a new project.
2. Paste the following code, replacing `"<YOUR_CALENDAR_ID>"` with your actual Google Calendar ID:

   ```javascript
   function doGet(e) {
     // Replace with your actual Calendar ID
     var calendarId = "<YOUR_CALENDAR_ID>@group.calendar.google.com";
     var calendar = CalendarApp.getCalendarById(calendarId);

     var now = new Date();
     var start = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
     var end = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months later

     var events = calendar.getEvents(start, end);
     var result = events.map(function (event) {
       return {
         id: event.getId(),
         title: event.getTitle(),
         description: event.getDescription() || "",
         start: event.getStartTime().toISOString(),
         end: event.getEndTime().toISOString(),
       };
     });

     return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
   }

   function doPost(e) {
     var data = JSON.parse(e.postData.contents);
     var calendar = CalendarApp.getCalendarById("<YOUR_CALENDAR_ID>@group.calendar.google.com");

     calendar.createEvent(data.title, new Date(data.start), new Date(data.end), {
       description: data.description,
     });

     return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Click **Deploy** > **New Deployment**.
4. Select **Web App**. Set **Execute as: Me** and **Who has access: Anyone**.
5. Copy the **Web App URL**.

### 2. App Configuration

1. Create a `.env` file in the root directory (if not present).
2. Add your script URL:

   ```env
   EXPO_PUBLIC_SCRIPT_URL=https://script.google.com/macros/s/.../exec
   ```

### 3. Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

## Building for Android (Standalone APK)

This app works best as a standalone APK since it uses a custom scheme.

### Steps

1. Install EAS CLI: `npm install -g eas-cli`
2. Run the build:

   ```bash
   npx eas build --platform android --profile preview
   ```

3. Add `EXPO_PUBLIC_SCRIPT_URL` to your `eas.json` under the relevant profile:

   ```json
   {
     "build": {
       "preview": {
         "distribution": "internal",
         "env": {
           "EXPO_PUBLIC_SCRIPT_URL": "https://script.google.com/macros/s/.../exec"
         }
       }
     }
   }
   ```

4. Download the generated APK and install it on your Android device.

## Preset logic placeholders

You can expand the presets in [utils/preset.ts](utils/preset.ts) using these placeholders in the description:

- `[KEY]`: Randomly picks one of "Ricardo" or "Carolina".
- `[A]` and `[B]`: Randomly assigns one of the two names to each tag (guaranteed to be different).
- `[KEY: option1, option2]`: Randomly picks one option and lists the "losers" in the description.

---

Built with ❤️ for Ricardo & Carolina.
