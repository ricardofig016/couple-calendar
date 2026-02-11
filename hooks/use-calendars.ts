import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { useScriptUrl } from "@/hooks/use-script-url";

const SELECTED_CALENDARS_KEY = "couple_calendar_selected_cals";
const PRIMARY_CALENDAR_KEY = "couple_calendar_primary_cal";

type CalendarInfo = {
  id: string;
  name?: string;
  description?: string;
  color?: string;
};

type CalendarListResponse = {
  ok: boolean;
  data?: CalendarInfo[];
  error?: string;
};

export function useCalendars() {
  const { scriptUrl } = useScriptUrl();
  const [availableCalendars, setAvailableCalendars] = useState<CalendarInfo[]>([]);
  const [selectedCalendars, setSelectedCalendarsState] = useState<string[]>([]);
  const [primaryCalendar, setPrimaryCalendarState] = useState<string | null>(null);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(true);

  useEffect(() => {
    const loadStored = async () => {
      try {
        const storedSelected = await AsyncStorage.getItem(SELECTED_CALENDARS_KEY);
        const storedPrimary = await AsyncStorage.getItem(PRIMARY_CALENDAR_KEY);

        if (storedSelected) {
          const parsed = JSON.parse(storedSelected) as string[];
          if (Array.isArray(parsed)) {
            setSelectedCalendarsState(parsed);
          }
        }

        if (storedPrimary) {
          setPrimaryCalendarState(storedPrimary);
        }
      } catch (error) {
        console.error("Failed to load calendar selections:", error);
      } finally {
        setIsLoadingCalendars(false);
      }
    };

    loadStored();
  }, []);

  const setSelectedCalendars = useCallback(async (ids: string[]) => {
    try {
      setSelectedCalendarsState(ids);
      await AsyncStorage.setItem(SELECTED_CALENDARS_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error("Failed to save selected calendars:", error);
    }
  }, []);

  const setPrimaryCalendar = useCallback(async (id: string | null) => {
    try {
      setPrimaryCalendarState(id);
      if (id) {
        await AsyncStorage.setItem(PRIMARY_CALENDAR_KEY, id);
      } else {
        await AsyncStorage.removeItem(PRIMARY_CALENDAR_KEY);
      }
    } catch (error) {
      console.error("Failed to save primary calendar:", error);
    }
  }, []);

  const fetchCalendarList = useCallback(async () => {
    if (!scriptUrl) return null;

    try {
      const separator = scriptUrl.includes("?") ? "&" : "?";
      const response = await fetch(`${scriptUrl}${separator}action=listCalendars`);
      const text = await response.text();
      const payload = JSON.parse(text) as CalendarListResponse;

      if (!payload.ok || !Array.isArray(payload.data)) {
        return null;
      }

      const calendars = payload.data;
      setAvailableCalendars(calendars);

      const calendarIds = calendars.map((cal) => cal.id).filter(Boolean);
      const validSelected = selectedCalendars.filter((id) => calendarIds.includes(id));
      const nextSelected = validSelected.length > 0 ? validSelected : calendarIds;

      if (nextSelected.length > 0) {
        await setSelectedCalendars(nextSelected);
      }

      if (!primaryCalendar || !calendarIds.includes(primaryCalendar)) {
        await setPrimaryCalendar(calendarIds[0] || null);
      }

      return calendars;
    } catch (error) {
      console.error("Failed to fetch calendars:", error);
      return null;
    }
  }, [primaryCalendar, scriptUrl, selectedCalendars, setPrimaryCalendar, setSelectedCalendars]);

  const ensureSelectedCalendars = useCallback(async () => {
    if (selectedCalendars.length > 0) return selectedCalendars;

    const calendars = await fetchCalendarList();
    if (!calendars) return [];
    const calendarIds = calendars.map((cal) => cal.id).filter(Boolean);
    return calendarIds;
  }, [fetchCalendarList, selectedCalendars]);

  const ensurePrimaryCalendar = useCallback(async () => {
    if (primaryCalendar) return primaryCalendar;

    const calendars = await fetchCalendarList();
    if (!calendars || calendars.length === 0) return null;

    return calendars[0].id || null;
  }, [fetchCalendarList, primaryCalendar]);

  return {
    availableCalendars,
    selectedCalendars,
    primaryCalendar,
    isLoadingCalendars,
    fetchCalendarList,
    setSelectedCalendars,
    setPrimaryCalendar,
    ensureSelectedCalendars,
    ensurePrimaryCalendar,
  };
}
