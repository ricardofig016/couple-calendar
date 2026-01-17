import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

const SCRIPT_URL = process.env.EXPO_PUBLIC_SCRIPT_URL;

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
}

interface EventContextType {
  events: CalendarEvent[];
  isLoading: boolean;
  refreshEvents: (showLoading?: boolean) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshEvents = useCallback(async (showLoading = true) => {
    if (!SCRIPT_URL) {
      console.warn("Script URL is not configured");
      return;
    }

    if (showLoading) setIsLoading(true);

    try {
      const response = await fetch(SCRIPT_URL);
      const text = await response.text();

      if (response.ok) {
        try {
          const data = JSON.parse(text);
          setEvents(data);
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
  }, []);

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
