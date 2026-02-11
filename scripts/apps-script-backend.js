// ============================================================
// COUPLE CALENDAR - Apps Script Backend
// Supports multiple calendars with calendar selection
// ============================================================

function doGet(e) {
  const action = e.parameter.action;

  if (action === "listCalendars") {
    try {
      const calendars = CalendarApp.getAllCalendars();
      const calendarList = calendars.map((cal) => ({
        id: cal.getId(),
        name: cal.getName(),
        description: cal.getDescription(),
        color: cal.getColor(),
      }));

      return sendResponse({ ok: true, data: calendarList }, 200);
    } catch (error) {
      return sendResponse({ ok: false, error: "Failed to list calendars: " + error.message }, 500);
    }
  }

  if (action !== "getEvents") {
    return sendResponse({ ok: false, error: "Invalid action. Use action=getEvents or action=listCalendars" }, 400);
  }

  try {
    const calendarId = e.parameter.calendarId;

    if (!calendarId) {
      return sendResponse({ ok: false, error: "calendarId parameter is required" }, 400);
    }

    const calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) {
      return sendResponse({ ok: false, error: "Calendar not found with ID: " + calendarId }, 404);
    }

    // Get events from 2 days ago to 90 days in the future
    const now = new Date();
    const startDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const events = calendar.getEvents(startDate, endDate);

    const tz = Session.getScriptTimeZone();
    const eventList = events.map((event) => ({
      id: event.getId(),
      title: event.getTitle(),
      description: event.getDescription(),
      start: formatIsoWithTz(event.getStartTime(), tz),
      end: formatIsoWithTz(event.getEndTime(), tz),
      calendarId: calendarId,
    }));

    return sendResponse({ ok: true, data: eventList }, 200);
  } catch (error) {
    return sendResponse({ ok: false, error: "Failed to fetch events: " + error.message }, 500);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const action = data.action;
    const calendarId = data.calendarId;

    if (!calendarId) {
      return sendResponse({ ok: false, error: "calendarId is required" }, 400);
    }

    const calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) {
      return sendResponse({ ok: false, error: "Calendar not found with ID: " + calendarId }, 404);
    }

    // Create event
    if (action === "create") {
      const title = data.title;
      const description = data.description || "";
      const startTime = parseDate(data.start);
      const endTime = parseDate(data.end);

      if (!title || !startTime || !endTime) {
        return sendResponse({ ok: false, error: "Missing or invalid fields: title, start, end" }, 400);
      }

      const event = calendar.createEvent(title, startTime, endTime);
      if (description) {
        event.setDescription(description);
      }

      return sendResponse({ ok: true, eventId: event.getId() }, 200);
    }

    // Edit event
    if (action === "edit") {
      const eventId = data.id;
      const event = findEvent(calendar, eventId);

      if (!event) {
        return sendResponse({ ok: false, error: "Event not found with ID: " + eventId }, 404);
      }

      if (data.title) {
        event.setTitle(data.title);
      }
      if (data.description !== undefined) {
        event.setDescription(data.description);
      }
      if (data.start && data.end) {
        const startTime = parseDate(data.start);
        const endTime = parseDate(data.end);
        if (!startTime || !endTime) {
          return sendResponse({ ok: false, error: "Invalid start/end date format" }, 400);
        }
        event.setTime(startTime, endTime);
      }

      return sendResponse({ ok: true, eventId: event.getId() }, 200);
    }

    // Delete event
    if (action === "delete") {
      const eventId = data.id;
      const event = findEvent(calendar, eventId);

      if (!event) {
        return sendResponse({ ok: false, error: "Event not found with ID: " + eventId }, 404);
      }

      event.deleteEvent();
      return sendResponse({ ok: true }, 200);
    }

    return sendResponse({ ok: false, error: "Unknown action: " + action }, 400);
  } catch (error) {
    Logger.log("Error: " + error.message);
    return sendResponse({ ok: false, error: "Server error: " + error.message }, 500);
  }
}

// ----------------- Helpers -----------------

function sendResponse(data, statusCode) {
  // Apps Script does not allow custom HTTP status codes,
  // so include status in the JSON response.
  const payload = Object.assign({ status: statusCode }, data);
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatIsoWithTz(date, tz) {
  return Utilities.formatDate(date, tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function findEvent(calendar, eventId) {
  if (eventId) {
    const event = calendar.getEventById(eventId);
    if (event) return event;
  }

  return null;
}
