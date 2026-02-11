import { useEvents } from "@/context/event-context";
import { useCalendars } from "@/hooks/use-calendars";
import { useScriptUrl } from "@/hooks/use-script-url";
import { Preset } from "@/utils/preset";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useEventForm() {
  const router = useRouter();
  const { refreshEvents } = useEvents();
  const { scriptUrl } = useScriptUrl();
  const { ensurePrimaryCalendar, primaryCalendar } = useCalendars();
  const params = useLocalSearchParams<{
    id?: string;
    calendarId?: string;
    title?: string;
    description?: string;
    start?: string;
    end?: string;
  }>();

  const [id, setId] = useState<string | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [isAllDay, setIsAllDay] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [startTime, setStartTimeState] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTimeState] = useState(() => {
    const d = new Date();
    d.setHours(13, 0, 0, 0);
    return d;
  });

  const [multiStartDate, setMultiStartDateState] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [multiEndDate, setMultiEndDateState] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(12, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    if (params.id && params.id !== id) {
      setId(params.id);
      setCalendarId(params.calendarId || null);
      setTitle(params.title || "");
      setDescription(params.description || "");

      if (params.start && params.end) {
        const start = new Date(params.start);
        const end = new Date(params.end);
        const isMulti = start.toDateString() !== end.toDateString();

        const allDayDetected =
          start.getHours() === 0 && start.getMinutes() === 0 && ((end.getHours() === 23 && end.getMinutes() === 59) || (end.getHours() === 0 && end.getMinutes() === 0 && isMulti));

        setIsMultiDay(isMulti);
        setIsAllDay(allDayDetected);

        if (isMulti) {
          setMultiStartDateState(start);
          setMultiEndDateState(end);
        } else {
          setDate(start);
          setStartTimeState(start);
          setEndTimeState(end);
        }
      }
    }
  }, [params.id, params.title, params.description, params.start, params.end, id]);

  useEffect(() => {
    if (!calendarId && primaryCalendar) {
      setCalendarId(primaryCalendar);
    }
  }, [calendarId, primaryCalendar]);

  const clearForm = useCallback(() => {
    setId(null);
    setCalendarId(null);
    setTitle("");
    setDescription("");
    setIsMultiDay(false);
    setIsAllDay(true);
    setSelectedPreset(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow);
    const start = new Date();
    start.setHours(12, 0, 0, 0);
    setStartTimeState(start);
    const end = new Date();
    end.setHours(13, 0, 0, 0);
    setEndTimeState(end);

    if (params.id) {
      router.setParams({ id: "", calendarId: "", title: "", description: "", start: "", end: "" });
    }
  }, [params.id, router]);

  const applyPreset = (preset: Preset) => {
    setSelectedPreset(preset);
    setTitle(preset.title);
    setDescription(preset.description);
  };

  const setStartTime = useCallback((selectedTime: Date) => {
    setStartTimeState(selectedTime);
    setEndTimeState((prev) => {
      if (prev.getTime() >= selectedTime.getTime()) return prev;
      const next = new Date(prev);
      next.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      return next;
    });
  }, []);

  const setEndTime = useCallback((selectedTime: Date) => {
    setEndTimeState(selectedTime);
    setStartTimeState((prev) => {
      if (selectedTime.getTime() >= prev.getTime()) return prev;
      const next = new Date(prev);
      next.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      return next;
    });
  }, []);

  const setMultiStartDate = useCallback(
    (selectedDate: Date) => {
      setMultiStartDateState(selectedDate);
      if (multiEndDate.getTime() < selectedDate.getTime()) {
        setMultiEndDateState(new Date(selectedDate));
      }
    },
    [multiEndDate],
  );

  const setMultiEndDate = useCallback(
    (selectedDate: Date) => {
      setMultiEndDateState(selectedDate);
      if (selectedDate.getTime() < multiStartDate.getTime()) {
        setMultiStartDateState(new Date(selectedDate));
      }
    },
    [multiStartDate],
  );

  const setMultiStartTime = useCallback(
    (selectedTime: Date) => {
      const nextStart = new Date(multiStartDate);
      nextStart.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setMultiStartDateState(nextStart);
      if (multiEndDate.getTime() < nextStart.getTime()) {
        setMultiEndDateState(new Date(nextStart));
      }
    },
    [multiEndDate, multiStartDate],
  );

  const setMultiEndTime = useCallback(
    (selectedTime: Date) => {
      const nextEnd = new Date(multiEndDate);
      nextEnd.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setMultiEndDateState(nextEnd);
      if (nextEnd.getTime() < multiStartDate.getTime()) {
        setMultiStartDateState(new Date(nextEnd));
      }
    },
    [multiEndDate, multiStartDate],
  );

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!scriptUrl) {
      Alert.alert("Error", "Script URL is not configured");
      return;
    }

    setIsLoading(true);

    let startIso, endIso;
    let eventStartDate: Date;

    if (isMultiDay) {
      if (isAllDay) {
        const start = new Date(multiStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(multiEndDate);
        end.setHours(23, 59, 59, 999);
        eventStartDate = start;
        startIso = start.toISOString();
        endIso = end.toISOString();
      } else {
        eventStartDate = multiStartDate;
        startIso = multiStartDate.toISOString();
        endIso = multiEndDate.toISOString();
      }
    } else {
      const start = new Date(date);
      const end = new Date(date);
      if (isAllDay) {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else {
        start.setHours(startTime.getHours(), startTime.getMinutes());
        end.setHours(endTime.getHours(), endTime.getMinutes());
      }
      eventStartDate = start;
      startIso = start.toISOString();
      endIso = end.toISOString();
    }

    try {
      const resolvedCalendarId = calendarId || (await ensurePrimaryCalendar());
      if (!resolvedCalendarId) {
        Alert.alert("Error", "No calendar available. Please connect a calendar in Settings.");
        return;
      }

      const finalTitle = selectedPreset ? selectedPreset.resolveTitle(title, eventStartDate, description) : title;
      const finalDescription = selectedPreset ? selectedPreset.resolve(description) : description;

      const action = id && id.length > 0 ? "edit" : "create";

      const response = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({
          action: action,
          id: id,
          calendarId: resolvedCalendarId,
          title: finalTitle,
          description: finalDescription,
          start: startIso,
          end: endIso,
        }),
      });

      const text = await response.text();
      const payload = JSON.parse(text) as { ok: boolean; error?: string };

      if (response.ok && payload.ok) {
        clearForm();
        refreshEvents(false);
        if (id) {
          router.push("/manage");
        }
      } else {
        throw new Error(payload.error || "Failed to save event");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    id,
    calendarId,
    setCalendarId,
    title,
    setTitle,
    description,
    setDescription,
    isMultiDay,
    setIsMultiDay,
    isAllDay,
    setIsAllDay,
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
    setMultiStartTime,
    setMultiEndTime,
    applyPreset,
    handleSubmit,
    clearForm,
  };
}
