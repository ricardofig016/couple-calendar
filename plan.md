# Implementation Plan: Couple Calendar App

This plan uses a **Google Apps Script** as a bridge to avoid OAuth complexity. The app will send a simple POST request to your script, which will then add the event to your Google Calendar.

## 1. Prerequisites (done)

- [Node.js](https://nodejs.org/) installed.
- [Expo Go](https://expo.dev/go) app installed on both phones.

## 2. Step 1: Initialize the Project (done)

```bash
npx create-expo-app@latest .
```

## 3. Step 2: Create the Google Apps Script Bridge (done)

This script acts as your own private API.

1. Go to [script.google.com](https://script.google.com/).
2. Click **New Project**.
3. Paste the following code (replace the placeholder email):

   ```javascript
   function doPost(e) {
     var data = JSON.parse(e.postData.contents);

     var calendar = CalendarApp.getDefaultCalendar();

     var event = calendar.createEvent(data.title, new Date(data.start), new Date(data.end), {
       description: data.description,
       guests: "carolinaop.co2003@gmail.com",
     });

     return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
   }
   ```

4. Click **Deploy** > **New Deployment**.
5. Select type: **Web App**.
6. Set "Execute as": **Me**.
7. Set "Who has access": **Anyone** (Your script URL will be secret).
8. **Copy the Web App URL** and add it to your `.env` file as `EXPO_PUBLIC_SCRIPT_URL`.

## 4. Step 3: Install UI Dependencies (done)

```bash
npx expo install @react-native-community/datetimepicker
```

## 5. Step 4: Build the Form UI

Create a screen in `app/(tabs)/index.tsx`:

- Title input.
- Date/Time picker.
- Submit button that calls `fetch(YOUR_SCRIPT_URL, ...)`.

## 6. Step 5: Testing

1. Run `npx expo start`.
2. Open in **Expo Go**.
3. Fill the form and check your Google Calendar!
