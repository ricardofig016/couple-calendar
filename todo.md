# Todo

- [ ] feat: add a holiday preset
- [ ] feat: add a day together preset
- [ ] feat: add a doctors appointment preset
- [ ] feat: add a cleaning preset
- [ ] feat: add a meeting preset
- [ ] feat: add a nap preset
- [ ] fix: when the user changes the start time/date, the end time/date should change if it is before the start time and vice versa.
- [ ] chore: remove upcoming features from manage screen
- [ ] feat: add a daily notification reminder for events happening that day at a user specified time (default 7am)
- [ ] feat: make the script input be the Deployment ID instead of the full URL, and construct the URL in the code.

- [x] feat: let the user specify the time range for fetching events from the calendar (currently hardcoded to 2 days in the past and 3 months in the future, keep that as default).
- [x] fix: warning "Android Bundled 171ms node_modules\expo-router\entry.js (1 module) WARN Script URL is not configured" when script is configured.
- [x] feat: let the user have multiple calendars to sync with, choose which calendar to add the event to when creating an event, chose which calendars to view events from when viewing events (checkbox).
- [x] fix: the data.action thing sent to the backend is not always "create" when creating a new event
- [x] feat: add an icon to the app (the image from the discord server).
- [x] feat: add a button to clear everything to default state.
- [x] feat: while the event being added, show a loading spinner to indicate the process is ongoing.
- [x] feat: add options to the event card: edit and delete
- [x] feat: manage tab should have a list of the events from the last 2 days the upcomming events in the next 3 months
- [x] feat: susbstitute unused explore tab with a new tab to manage events.
- [x] fix: vertical spacing between start/end time and their inputs (while spans multiple days in not chekced) is smaller than the other vertical spacings between date and time labels and their inputs
- [x] fix: text in date and time inputs is too light
- [x] **Fun Automation**: For specific presets like "Grocery Shopping," use an RNG (Random Number Generator) to decide who does what. Example: "It's [Name]'s turn to push the cart!!" or "You're paying this time!" automatically added to the description.
- [x] **Auto-Emoji Titles**: Automatically prepend an emoji to the event title based on the preset (e.g., 🍴 for Dinner, 🍿 for Movie).
- [x] **Presets**: Create quick-select templates for common events (e.g., Dates, Movie Night, Gym). This saves time manually typing titles and descriptions.
