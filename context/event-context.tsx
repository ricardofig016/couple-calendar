import { useCalendarId } from "@/hooks/use-calendar-id";
import { useScriptUrl } from "@/hooks/use-script-url";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

export interface CalendarEvent {
  id: string;
  iCalUid?: string;
  title: string;
  description: string;
  start: string;
  end: string;
  calendarId: string;
}

interface EventContextType {
  events: CalendarEvent[];
  isLoading: boolean;
  refreshEvents: (showLoading?: boolean) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { scriptUrl } = useScriptUrl();
  const { ensureCalendarId } = useCalendarId();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshEvents = useCallback(
    async (showLoading = true) => {
      if (!scriptUrl) {
        console.warn("Script URL is not configured");
        return;
      }

      if (showLoading) setIsLoading(true);

      try {
        const calendarId = await ensureCalendarId();
        if (!calendarId) {
          if (showLoading) {
            Alert.alert("Error", "No calendar available. Please connect a calendar in Settings.");
          }
          return;
        }

        const separator = scriptUrl.includes("?") ? "&" : "?";
        const response = await fetch(`${scriptUrl}${separator}action=getEvents&calendarId=${encodeURIComponent(calendarId)}`);
        const text = await response.text();

        if (response.ok) {
          try {
            const payload = JSON.parse(text) as { ok: boolean; data?: CalendarEvent[]; error?: string };
            if (!payload.ok || !Array.isArray(payload.data)) {
              throw new Error(payload.error || "Failed to fetch events.");
            }
            setEvents(payload.data);
          } catch (_e) {
            console.error("Failed to parse JSON:", text.substring(0, 100));
            // If we're already loading and it fails, don't show alert to prevent annoying popups on start
            // unless it's a manual refresh
            if (!showLoading) return;
            Alert.alert("Error", "Backend returned HTML instead of JSON. Ensure your Google Apps Script is deployed correctly.");
          }
        } else {
          throw new Error("Failed to fetch events: " + response.status);
        }
      } catch (error) {
        console.error(error);
        if (showLoading) {
          Alert.alert("Error", "Could not load events.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [scriptUrl],
  );

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  return <EventContext.Provider value={{ events, isLoading, refreshEvents }}>{children}</EventContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}
