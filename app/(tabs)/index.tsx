import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Alert, Button, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Using environment variable for security
const SCRIPT_URL = process.env.EXPO_PUBLIC_SCRIPT_URL;

export default function HomeScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!SCRIPT_URL) {
      Alert.alert("Error", "Script URL is not configured");
      return;
    }

    // Combine date and times
    const start = new Date(date);
    start.setHours(startTime.getHours(), startTime.getMinutes());

    const end = new Date(date);
    end.setHours(endTime.getHours(), endTime.getMinutes());

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          start: start.toISOString(),
          end: end.toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Event added to calendars!");
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
    <ParallaxScrollView headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }} headerImage={<IconSymbol size={140} color="#808080" name="calendar" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Add Event</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedText type="defaultSemiBold">Event Title</ThemedText>
        <TextInput style={styles.input} placeholder="e.g. Dinner Date" placeholderTextColor="#888" value={title} onChangeText={setTitle} />

        <ThemedText type="defaultSemiBold">Description (Optional)</ThemedText>
        <TextInput style={[styles.input, { height: 80 }]} placeholder="Details..." placeholderTextColor="#888" multiline value={description} onChangeText={setDescription} />

        <ThemedText type="defaultSemiBold">Date</ThemedText>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <ThemedText>{date.toLocaleDateString()}</ThemedText>
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Start</ThemedText>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartTimePicker(true)}>
              <ThemedText>{startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={{ width: 20 }} />
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">End</ThemedText>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndTimePicker(true)}>
              <ThemedText>{endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Button title="Schedule for Both" onPress={handleSubmit} color="#0a7ea4" />
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
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -20,
    left: 20,
    position: "absolute",
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
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    color: "#000",
    backgroundColor: "#fff",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
