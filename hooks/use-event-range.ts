import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const DAYS_BACK_KEY = "couple_calendar_days_back";
const DAYS_FORWARD_KEY = "couple_calendar_days_forward";

const DEFAULT_DAYS_BACK = 2;
const DEFAULT_DAYS_FORWARD = 90;

function parseStoredNumber(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
}

export async function readEventRangeFromStorage() {
  const storedBack = await AsyncStorage.getItem(DAYS_BACK_KEY);
  const storedForward = await AsyncStorage.getItem(DAYS_FORWARD_KEY);

  return {
    daysBack: parseStoredNumber(storedBack, DEFAULT_DAYS_BACK),
    daysForward: parseStoredNumber(storedForward, DEFAULT_DAYS_FORWARD),
  };
}

export function useEventRange() {
  const [daysBack, setDaysBackState] = useState(DEFAULT_DAYS_BACK);
  const [daysForward, setDaysForwardState] = useState(DEFAULT_DAYS_FORWARD);
  const [isLoadingEventRange, setIsLoadingEventRange] = useState(true);

  useEffect(() => {
    const loadRange = async () => {
      try {
        const storedRange = await readEventRangeFromStorage();
        setDaysBackState(storedRange.daysBack);
        setDaysForwardState(storedRange.daysForward);
      } catch (error) {
        console.error("Failed to load event range:", error);
      } finally {
        setIsLoadingEventRange(false);
      }
    };

    loadRange();
  }, []);

  const setDaysBack = useCallback(async (value: number) => {
    try {
      const nextValue = Math.max(0, Math.floor(value));
      setDaysBackState(nextValue);
      await AsyncStorage.setItem(DAYS_BACK_KEY, String(nextValue));
    } catch (error) {
      console.error("Failed to save days back:", error);
    }
  }, []);

  const setDaysForward = useCallback(async (value: number) => {
    try {
      const nextValue = Math.max(0, Math.floor(value));
      setDaysForwardState(nextValue);
      await AsyncStorage.setItem(DAYS_FORWARD_KEY, String(nextValue));
    } catch (error) {
      console.error("Failed to save days forward:", error);
    }
  }, []);

  const resetDefaults = useCallback(async () => {
    try {
      setDaysBackState(DEFAULT_DAYS_BACK);
      setDaysForwardState(DEFAULT_DAYS_FORWARD);
      await AsyncStorage.setItem(DAYS_BACK_KEY, String(DEFAULT_DAYS_BACK));
      await AsyncStorage.setItem(DAYS_FORWARD_KEY, String(DEFAULT_DAYS_FORWARD));
    } catch (error) {
      console.error("Failed to reset event range:", error);
    }
  }, []);

  return {
    daysBack,
    daysForward,
    isLoadingEventRange,
    setDaysBack,
    setDaysForward,
    resetDefaults,
    defaults: {
      daysBack: DEFAULT_DAYS_BACK,
      daysForward: DEFAULT_DAYS_FORWARD,
    },
  };
}
