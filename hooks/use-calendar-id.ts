import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { useScriptUrl } from "@/hooks/use-script-url";

const CALENDAR_ID_KEY = "couple_calendar_primary_calendar_id";

type CalendarListResponse = {
  ok: boolean;
  data?: { id: string }[];
  error?: string;
};

export function useCalendarId() {
  const { scriptUrl } = useScriptUrl();
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCalendarId = async () => {
      try {
        const stored = await AsyncStorage.getItem(CALENDAR_ID_KEY);
        if (stored) {
          setCalendarId(stored);
        }
      } catch (error) {
        console.error("Failed to load calendar ID:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendarId();
  }, []);

  const setPrimaryCalendarId = useCallback(async (id: string | null) => {
    try {
      if (id) {
        await AsyncStorage.setItem(CALENDAR_ID_KEY, id);
      } else {
        await AsyncStorage.removeItem(CALENDAR_ID_KEY);
      }
      setCalendarId(id);
    } catch (error) {
      console.error("Failed to save calendar ID:", error);
    }
  }, []);

  const ensureCalendarId = useCallback(async () => {
    if (calendarId) return calendarId;
    if (!scriptUrl) return null;

    try {
      const separator = scriptUrl.includes("?") ? "&" : "?";
      const response = await fetch(`${scriptUrl}${separator}action=listCalendars`);
      const text = await response.text();
      const payload = JSON.parse(text) as CalendarListResponse;

      if (!payload.ok || !Array.isArray(payload.data) || payload.data.length === 0) {
        return null;
      }

      const firstId = payload.data[0]?.id;
      if (!firstId) return null;

      await AsyncStorage.setItem(CALENDAR_ID_KEY, firstId);
      setCalendarId(firstId);
      return firstId;
    } catch (error) {
      console.error("Failed to fetch calendars:", error);
      return null;
    }
  }, [calendarId, scriptUrl]);

  return { calendarId, setPrimaryCalendarId, ensureCalendarId, isLoading };
}
