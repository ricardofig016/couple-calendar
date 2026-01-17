import { Checkbox } from "expo-checkbox";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateTimePickerButton } from "@/components/date-time-picker-button";
import { DateTimePickerModals } from "@/components/date-time-picker-modals";
import { PresetList } from "@/components/preset-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEventForm } from "@/hooks/use-event-form";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function HomeScreen() {
  const {
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
    setMultiStartTime,
    setMultiEndTime,
    applyPreset,
    handleSubmit,
    clearForm,
  } = useEventForm();

  const color = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icon");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showMultiStartDatePicker, setShowMultiStartDatePicker] = useState(false);
  const [showMultiStartTimePicker, setShowMultiStartTimePicker] = useState(false);
  const [showMultiEndDatePicker, setShowMultiEndDatePicker] = useState(false);
  const [showMultiEndTimePicker, setShowMultiEndTimePicker] = useState(false);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.container}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title">{id ? "Edit Event" : "Add Event"}</ThemedText>
            </ThemedView>
            <TouchableOpacity onPress={clearForm} disabled={isLoading}>
              <ThemedText style={{ color: "#ff4444" }}>Clear</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.form}>
            <ThemedText type="defaultSemiBold">Presets</ThemedText>
            <PresetList onSelect={applyPreset} isLoading={isLoading} />

            <ThemedText type="defaultSemiBold">Title</ThemedText>
            <TextInput
              style={[styles.input, { color, backgroundColor, borderColor: iconColor }]}
              placeholder="e.g. Dinner Date"
              placeholderTextColor={iconColor}
              value={title}
              onChangeText={setTitle}
              editable={!isLoading}
            />

            <ThemedText type="defaultSemiBold">Description (Optional)</ThemedText>
            <TextInput
              style={[styles.input, { height: 80, color, backgroundColor, borderColor: iconColor }]}
              placeholder="Details..."
              placeholderTextColor={iconColor}
              multiline
              value={description}
              onChangeText={setDescription}
              editable={!isLoading}
            />

            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsMultiDay(!isMultiDay)} activeOpacity={0.8} disabled={isLoading}>
              <Checkbox value={isMultiDay} onValueChange={setIsMultiDay} color={isMultiDay ? "#0a7ea4" : undefined} disabled={isLoading} />
              <ThemedText type="defaultSemiBold" style={styles.checkboxLabel}>
                multiple days
              </ThemedText>
            </TouchableOpacity>

            {!isMultiDay ? (
              <>
                <DateTimePickerButton label="Date" value={date.toLocaleDateString("en-GB")} onPress={() => setShowDatePicker(true)} disabled={isLoading} />

                <View style={styles.row}>
                  <DateTimePickerButton
                    style={{ flex: 1 }}
                    label="Start"
                    value={startTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    onPress={() => setShowStartTimePicker(true)}
                    disabled={isLoading}
                  />
                  <View style={{ width: 20 }} />
                  <DateTimePickerButton
                    style={{ flex: 1 }}
                    label="End"
                    value={endTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    onPress={() => setShowEndTimePicker(true)}
                    disabled={isLoading}
                  />
                </View>
              </>
            ) : (
              <>
                <ThemedText type="defaultSemiBold">Start</ThemedText>
                <View style={styles.row}>
                  <DateTimePickerButton style={{ flex: 1.5 }} value={multiStartDate.toLocaleDateString("en-GB")} onPress={() => setShowMultiStartDatePicker(true)} disabled={isLoading} />
                  <View style={{ width: 10 }} />
                  <DateTimePickerButton
                    style={{ flex: 1 }}
                    value={multiStartDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    onPress={() => setShowMultiStartTimePicker(true)}
                    disabled={isLoading}
                  />
                </View>

                <ThemedText type="defaultSemiBold">End</ThemedText>
                <View style={styles.row}>
                  <DateTimePickerButton style={{ flex: 1.5 }} value={multiEndDate.toLocaleDateString("en-GB")} onPress={() => setShowMultiEndDatePicker(true)} disabled={isLoading} />
                  <View style={{ width: 10 }} />
                  <DateTimePickerButton
                    style={{ flex: 1 }}
                    value={multiEndDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    onPress={() => setShowMultiEndTimePicker(true)}
                    disabled={isLoading}
                  />
                </View>
              </>
            )}

            <View style={{ marginTop: 20 }}>
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: "#0a7ea4" }, isLoading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.submitButtonText}>{id ? "Update Event" : "Schedule Event"}</ThemedText>}
              </TouchableOpacity>
            </View>
          </ThemedView>

          <DateTimePickerModals
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            date={date}
            setDate={setDate}
            showStartTimePicker={showStartTimePicker}
            setShowStartTimePicker={setShowStartTimePicker}
            startTime={startTime}
            setStartTime={setStartTime}
            showEndTimePicker={showEndTimePicker}
            setShowEndTimePicker={setShowEndTimePicker}
            endTime={endTime}
            setEndTime={setEndTime}
            showMultiStartDatePicker={showMultiStartDatePicker}
            setShowMultiStartDatePicker={setShowMultiStartDatePicker}
            multiStartDate={multiStartDate}
            setMultiStartDate={setMultiStartDate}
            showMultiStartTimePicker={showMultiStartTimePicker}
            setShowMultiStartTimePicker={setShowMultiStartTimePicker}
            setMultiStartTime={setMultiStartTime}
            showMultiEndDatePicker={showMultiEndDatePicker}
            setShowMultiEndDatePicker={setShowMultiEndDatePicker}
            multiEndDate={multiEndDate}
            setMultiEndDate={setMultiEndDate}
            showMultiEndTimePicker={showMultiEndTimePicker}
            setShowMultiEndTimePicker={setShowMultiEndTimePicker}
            setMultiEndTime={setMultiEndTime}
          />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
