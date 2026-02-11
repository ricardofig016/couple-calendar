import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const SCRIPT_DEPLOYMENT_ID_KEY = "couple_calendar_script_url";

const SCRIPT_URL_PREFIX = "https://script.google.com/macros/s/";
const SCRIPT_URL_SUFFIX = "/exec";

function buildScriptUrl(deploymentId: string) {
  return `${SCRIPT_URL_PREFIX}${deploymentId}${SCRIPT_URL_SUFFIX}`;
}

function extractDeploymentId(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/\/s\/([^/]+)\/exec/i);
  if (match) return match[1];

  if (trimmed.includes("http")) return null;
  return trimmed;
}

export function useScriptUrl() {
  const [deploymentId, setDeploymentIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load script URL from AsyncStorage on mount
  useEffect(() => {
    const loadScriptUrl = async () => {
      try {
        const stored = await AsyncStorage.getItem(SCRIPT_DEPLOYMENT_ID_KEY);
        const parsedDeploymentId = extractDeploymentId(stored);

        if (parsedDeploymentId) {
          setDeploymentIdState(parsedDeploymentId);
          if (stored !== parsedDeploymentId) {
            await AsyncStorage.setItem(SCRIPT_DEPLOYMENT_ID_KEY, parsedDeploymentId);
          }
        }
      } catch (error) {
        console.error("Failed to load script URL:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScriptUrl();
  }, []);

  const setDeploymentId = useCallback(async (value: string) => {
    try {
      const nextDeploymentId = extractDeploymentId(value);
      if (nextDeploymentId) {
        await AsyncStorage.setItem(SCRIPT_DEPLOYMENT_ID_KEY, nextDeploymentId);
        setDeploymentIdState(nextDeploymentId);
      } else {
        await AsyncStorage.removeItem(SCRIPT_DEPLOYMENT_ID_KEY);
        setDeploymentIdState(null);
      }
    } catch (error) {
      console.error("Failed to save script URL:", error);
    }
  }, []);

  const clearDeploymentId = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SCRIPT_DEPLOYMENT_ID_KEY);
      setDeploymentIdState(null);
    } catch (error) {
      console.error("Failed to clear script URL:", error);
    }
  }, []);

  const scriptUrl = deploymentId ? buildScriptUrl(deploymentId) : null;

  return {
    scriptUrl,
    deploymentId,
    setDeploymentId,
    clearDeploymentId,
    isLoading,
  };
}
