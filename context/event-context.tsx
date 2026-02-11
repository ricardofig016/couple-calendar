import { useCalendars } from "@/hooks/use-calendars";
import { useScriptUrl } from "@/hooks/use-script-url";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

export interface CalendarEvent {
  id: string;
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
  const { ensureSelectedCalendars } = useCalendars();
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
        const calendarIds = await ensureSelectedCalendars();
        if (calendarIds.length === 0) {
          if (showLoading) {
            Alert.alert("Error", "No calendars selected. Please choose calendars in Settings.");
          }
          return;
        }

        const separator = scriptUrl.includes("?") ? "&" : "?";
        const results = await Promise.allSettled(
          calendarIds.map(async (calendarId) => {
            const response = await fetch(`${scriptUrl}${separator}action=getEvents&calendarId=${encodeURIComponent(calendarId)}`);
            const text = await response.text();

            if (!response.ok) {
              throw new Error("Failed to fetch events: " + response.status);
            }

            const payload = JSON.parse(text) as { ok: boolean; data?: CalendarEvent[]; error?: string };
            if (!payload.ok || !Array.isArray(payload.data)) {
              throw new Error(payload.error || "Failed to fetch events.");
            }

            return payload.data;
          }),
        );

        const merged = results.filter((result): result is PromiseFulfilledResult<CalendarEvent[]> => result.status === "fulfilled").flatMap((result) => result.value);

        if (merged.length === 0) {
          const rejection = results.find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
          if (rejection) {
            throw rejection.reason;
          }
        }

        merged.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        setEvents(merged);
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
