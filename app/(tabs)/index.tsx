import DateTimePicker from "@react-native-community/datetimepicker";
import { Checkbox } from "expo-checkbox";
import { useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Preset, PRESETS } from "@/utils/preset";

// Using environment variable for security
const SCRIPT_URL = process.env.EXPO_PUBLIC_SCRIPT_URL;

export default function HomeScreen() {
  const color = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icon");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  // Default to tomorrow at 12:00
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

  // Multi-day state defaults
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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showMultiStartDatePicker, setShowMultiStartDatePicker] = useState(false);
  const [showMultiStartTimePicker, setShowMultiStartTimePicker] = useState(false);
  const [showMultiEndDatePicker, setShowMultiEndDatePicker] = useState(false);
  const [showMultiEndTimePicker, setShowMultiEndTimePicker] = useState(false);

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

    let startIso, endIso;

    if (isMultiDay) {
      startIso = multiStartDate.toISOString();
      endIso = multiEndDate.toISOString();
    } else {
      // Combine date and times
      const start = new Date(date);
      start.setHours(startTime.getHours(), startTime.getMinutes());

      const end = new Date(date);
      end.setHours(endTime.getHours(), endTime.getMinutes());

      startIso = start.toISOString();
      endIso = end.toISOString();
    }

    try {
      const finalDescription = selectedPreset ? selectedPreset.resolve(description) : description;

      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          title,
          description: finalDescription,
          start: startIso,
          end: endIso,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Event added to calendar!");
        setTitle("");
        setDescription("");
      } else {
        throw new Error("Failed to add event");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Check your Script URL: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.container}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Add Event</ThemedText>
          </ThemedView>

          <ThemedView style={styles.form}>
            <ThemedText type="defaultSemiBold">Presets</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsContainer}>
              {PRESETS.map((preset) => (
                <TouchableOpacity key={preset.label} style={styles.presetChip} onPress={() => applyPreset(preset)}>
                  <ThemedText style={styles.presetText}>{preset.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ThemedText type="defaultSemiBold">Title</ThemedText>
            <TextInput
              style={[styles.input, { color, backgroundColor, borderColor: iconColor }]}
              placeholder="e.g. Dinner Date"
              placeholderTextColor={iconColor}
              value={title}
              onChangeText={setTitle}
            />

            <ThemedText type="defaultSemiBold">Description (Optional)</ThemedText>
            <TextInput
              style={[styles.input, { height: 80, color, backgroundColor, borderColor: iconColor }]}
              placeholder="Details..."
              placeholderTextColor={iconColor}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsMultiDay(!isMultiDay)} activeOpacity={0.8}>
              <Checkbox value={isMultiDay} onValueChange={setIsMultiDay} color={isMultiDay ? "#0a7ea4" : undefined} />
              <ThemedText type="defaultSemiBold" style={styles.checkboxLabel}>
                Spans multiple days?
              </ThemedText>
            </TouchableOpacity>

            {!isMultiDay ? (
              <>
                <ThemedText type="defaultSemiBold">Date</ThemedText>
                <TouchableOpacity style={[styles.dateButton, { backgroundColor, borderColor: iconColor }]} onPress={() => setShowDatePicker(true)}>
                  <ThemedText type="defaultSemiBold">{date.toLocaleDateString("en-GB")}</ThemedText>
                </TouchableOpacity>

                <View style={styles.row}>
                  <View style={{ flex: 1, gap: 12 }}>
                    <ThemedText type="defaultSemiBold">Start</ThemedText>
                    <TouchableOpacity style={[styles.dateButton, { backgroundColor, borderColor: iconColor }]} onPress={() => setShowStartTimePicker(true)}>
                      <ThemedText type="defaultSemiBold">{startTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: 20 }} />
                  <View style={{ flex: 1, gap: 12 }}>
                    <ThemedText type="defaultSemiBold">End</ThemedText>
                    <TouchableOpacity style={[styles.dateButton, { backgroundColor, borderColor: iconColor }]} onPress={() => setShowEndTimePicker(true)}>
                      <ThemedText type="defaultSemiBold">{endTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <>
                <ThemedText type="defaultSemiBold">Start</ThemedText>
                <View style={styles.row}>
                  <TouchableOpacity style={[styles.dateButton, { flex: 1.5, backgroundColor, borderColor: iconColor }]} onPress={() => setShowMultiStartDatePicker(true)}>
                    <ThemedText type="defaultSemiBold">{multiStartDate.toLocaleDateString("en-GB")}</ThemedText>
                  </TouchableOpacity>
                  <View style={{ width: 10 }} />
                  <TouchableOpacity style={[styles.dateButton, { flex: 1, backgroundColor, borderColor: iconColor }]} onPress={() => setShowMultiStartTimePicker(true)}>
                    <ThemedText type="defaultSemiBold">{multiStartDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}</ThemedText>
                  </TouchableOpacity>
                </View>

                <ThemedText type="defaultSemiBold">End</ThemedText>
                <View style={styles.row}>
                  <TouchableOpacity style={[styles.dateButton, { flex: 1.5, backgroundColor, borderColor: iconColor }]} onPress={() => setShowMultiEndDatePicker(true)}>
                    <ThemedText type="defaultSemiBold">{multiEndDate.toLocaleDateString("en-GB")}</ThemedText>
                  </TouchableOpacity>
                  <View style={{ width: 10 }} />
                  <TouchableOpacity style={[styles.dateButton, { flex: 1, backgroundColor, borderColor: iconColor }]} onPress={() => setShowMultiEndTimePicker(true)}>
                    <ThemedText type="defaultSemiBold">{multiEndDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <View style={{ marginTop: 20 }}>
              <Button title="Schedule Event" onPress={handleSubmit} color="#0a7ea4" />
            </View>
          </ThemedView>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                setShowStartTimePicker(false);
                if (selectedTime) setStartTime(selectedTime);
              }}
            />
          )}

          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                setShowEndTimePicker(false);
                if (selectedTime) setEndTime(selectedTime);
              }}
            />
          )}

          {showMultiStartDatePicker && (
            <DateTimePicker
              value={multiStartDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowMultiStartDatePicker(false);
                if (selectedDate) {
                  const newDate = new Date(selectedDate);
                  newDate.setHours(multiStartDate.getHours(), multiStartDate.getMinutes());
                  setMultiStartDate(newDate);
                }
              }}
            />
          )}

          {showMultiStartTimePicker && (
            <DateTimePicker
              value={multiStartDate}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                setShowMultiStartTimePicker(false);
                if (selectedTime) {
                  const newDate = new Date(multiStartDate);
                  newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                  setMultiStartDate(newDate);
                }
              }}
            />
          )}

          {showMultiEndDatePicker && (
            <DateTimePicker
              value={multiEndDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowMultiEndDatePicker(false);
                if (selectedDate) {
                  const newDate = new Date(selectedDate);
                  newDate.setHours(multiEndDate.getHours(), multiEndDate.getMinutes());
                  setMultiEndDate(newDate);
                }
              }}
            />
          )}

          {showMultiEndTimePicker && (
            <DateTimePicker
              value={multiEndDate}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                setShowMultiEndTimePicker(false);
                if (selectedTime) {
                  const newDate = new Date(multiEndDate);
                  newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                  setMultiEndDate(newDate);
                }
              }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    gap: 16,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  form: {
    padding: 2,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  presetsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  presetChip: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  presetText: {
    color: "#fff",
    fontWeight: "600",
  },
});
