import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const SCRIPT_URL_KEY = "couple_calendar_script_url";

export function useScriptUrl() {
  const [scriptUrl, setScriptUrlState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load script URL from AsyncStorage on mount
  useEffect(() => {
    const loadScriptUrl = async () => {
      try {
        const stored = await AsyncStorage.getItem(SCRIPT_URL_KEY);
        if (stored) {
          setScriptUrlState(stored);
        }
      } catch (error) {
        console.error("Failed to load script URL:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScriptUrl();
  }, []);

  const setScriptUrl = useCallback(async (url: string) => {
    try {
      if (url.trim()) {
        await AsyncStorage.setItem(SCRIPT_URL_KEY, url);
        setScriptUrlState(url);
      } else {
        await AsyncStorage.removeItem(SCRIPT_URL_KEY);
        setScriptUrlState(null);
      }
    } catch (error) {
      console.error("Failed to save script URL:", error);
    }
  }, []);

  const clearScriptUrl = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SCRIPT_URL_KEY);
      setScriptUrlState(null);
    } catch (error) {
      console.error("Failed to clear script URL:", error);
    }
  }, []);

  return { scriptUrl, setScriptUrl, clearScriptUrl, isLoading };
}
