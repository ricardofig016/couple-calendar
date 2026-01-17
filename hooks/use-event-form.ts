import { Preset } from "@/utils/preset";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useEvents } from "@/context/event-context";

const SCRIPT_URL = process.env.EXPO_PUBLIC_SCRIPT_URL;

export function useEventForm() {
  const router = useRouter();
  const { refreshEvents } = useEvents();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    start?: string;
    end?: string;
  }>();

  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(13, 0, 0, 0);
    return d;
  });

  const [multiStartDate, setMultiStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [multiEndDate, setMultiEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(12, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    if (params.id && params.id !== id) {
      setId(params.id);
      setTitle(params.title || "");
      setDescription(params.description || "");

      if (params.start && params.end) {
        const start = new Date(params.start);
        const end = new Date(params.end);
        const isMulti = start.toDateString() !== end.toDateString();
        setIsMultiDay(isMulti);

        if (isMulti) {
          setMultiStartDate(start);
          setMultiEndDate(end);
        } else {
          setDate(start);
          setStartTime(start);
          setEndTime(end);
        }
      }
    }
  }, [params.id, params.title, params.description, params.start, params.end, id]);

  const clearForm = useCallback(() => {
    setId(null);
    setTitle("");
    setDescription("");
    setIsMultiDay(false);
    setSelectedPreset(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow);
    const start = new Date();
    start.setHours(12, 0, 0, 0);
    setStartTime(start);
    const end = new Date();
    end.setHours(13, 0, 0, 0);
    setEndTime(end);

    if (params.id) {
      router.setParams({ id: "", title: "", description: "", start: "", end: "" });
    }
  }, [params.id, router]);

  const applyPreset = (preset: Preset) => {
    setSelectedPreset(preset);
    setTitle(preset.title);
    setDescription(preset.description);
  };

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!SCRIPT_URL) {
      Alert.alert("Error", "Script URL is not configured");
      return;
    }

    setIsLoading(true);

    let startIso, endIso;
    let eventStartDate: Date;

    if (isMultiDay) {
      eventStartDate = multiStartDate;
      startIso = multiStartDate.toISOString();
      endIso = multiEndDate.toISOString();
    } else {
      const start = new Date(date);
      start.setHours(startTime.getHours(), startTime.getMinutes());
      eventStartDate = start;
      const end = new Date(date);
      end.setHours(endTime.getHours(), endTime.getMinutes());
      startIso = start.toISOString();
      endIso = end.toISOString();
    }

    try {
      const finalTitle = selectedPreset ? selectedPreset.resolveTitle(title, eventStartDate) : title;
      const finalDescription = selectedPreset ? selectedPreset.resolve(description) : description;

      const action = id && id.length > 0 ? "edit" : "create";

      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: action,
          id: id,
          title: finalTitle,
          description: finalDescription,
          start: startIso,
          end: endIso,
        }),
      });

      if (response.ok) {
        clearForm();
        refreshEvents(false);
        if (id) {
          router.push("/manage");
        }
      } else {
        throw new Error("Failed to save event");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    id,
    title,
    setTitle,
    description,
    setDescription,
    isMultiDay,
    setIsMultiDay,
    isLoading,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    multiStartDate,
    setMultiStartDate,
    multiEndDate,
    setMultiEndDate,
    setMultiStartTime: useCallback((selectedTime: Date) => {
      setMultiStartDate((prev) => {
        const newDate = new Date(prev);
        newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
        return newDate;
      });
    }, []),
    setMultiEndTime: useCallback((selectedTime: Date) => {
      setMultiEndDate((prev) => {
        const newDate = new Date(prev);
        newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
        return newDate;
      });
    }, []),
    applyPreset,
    handleSubmit,
    clearForm,
  };
}
