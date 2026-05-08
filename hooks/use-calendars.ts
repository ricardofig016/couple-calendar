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

  // Clear available calendars when script URL changes to ensure fresh calendar list
  useEffect(() => {
    setAvailableCalendars([]);
  }, [scriptUrl]);

  const loadStoredSelections = useCallback(async () => {
    try {
      const storedSelected = await AsyncStorage.getItem(SELECTED_CALENDARS_KEY);
      const storedPrimary = await AsyncStorage.getItem(PRIMARY_CALENDAR_KEY);

      const parsedSelected = storedSelected ? (JSON.parse(storedSelected) as string[]) : [];
      const nextSelected = Array.isArray(parsedSelected) ? parsedSelected : [];
      setSelectedCalendarsState(nextSelected);

      const nextPrimary = storedPrimary || null;
      setPrimaryCalendarState(nextPrimary);

      return { selected: nextSelected, primary: nextPrimary };
    } catch (error) {
      console.error("Failed to load calendar selections:", error);
      return { selected: [], primary: null };
    }
  }, []);

  useEffect(() => {
    const loadStored = async () => {
      await loadStoredSelections();
      setIsLoadingCalendars(false);
    };

    loadStored();
  }, [loadStoredSelections]);

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
      const stored = await loadStoredSelections();
      const separator = scriptUrl.includes("?") ? "&" : "?";
      const response = await fetch(`${scriptUrl}${separator}action=listCalendars`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch calendars: HTTP ${response.status}. Please check your deployment ID.`);
      }
      
      const text = await response.text();
      const payload = JSON.parse(text) as CalendarListResponse;

      if (!payload.ok || !Array.isArray(payload.data)) {
        return null;
      }

      const calendars = payload.data;
      setAvailableCalendars(calendars);

      const calendarIds = calendars.map((cal) => cal.id).filter(Boolean);
      const validSelected = stored.selected.filter((id) => calendarIds.includes(id));
      const nextSelected = validSelected.length > 0 ? validSelected : calendarIds;

      if (nextSelected.length > 0) {
        await setSelectedCalendars(nextSelected);
      }

      if (!stored.primary || !calendarIds.includes(stored.primary)) {
        await setPrimaryCalendar(calendarIds[0] || null);
      }

      return calendars;
    } catch (error) {
      console.error("Failed to fetch calendars:", error);
      return null;
    }
  }, [loadStoredSelections, scriptUrl, setPrimaryCalendar, setSelectedCalendars]);

  const ensureSelectedCalendars = useCallback(async () => {
    const stored = await loadStoredSelections();
    if (stored.selected.length > 0) return stored.selected;

    const calendars = await fetchCalendarList();
    if (!calendars) return [];
    const calendarIds = calendars.map((cal) => cal.id).filter(Boolean);
    return calendarIds;
  }, [fetchCalendarList, loadStoredSelections]);

  const ensurePrimaryCalendar = useCallback(async () => {
    const stored = await loadStoredSelections();
    if (stored.primary) return stored.primary;

    const calendars = await fetchCalendarList();
    if (!calendars || calendars.length === 0) return null;

    return calendars[0].id || null;
  }, [fetchCalendarList, loadStoredSelections]);

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
    loadStoredSelections,
  };
}
