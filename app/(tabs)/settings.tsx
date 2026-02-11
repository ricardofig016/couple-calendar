import { Checkbox } from "expo-checkbox";
import { Appearance, Linking, Platform, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useCalendars } from "@/hooks/use-calendars";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useScriptUrl } from "@/hooks/use-script-url";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect, useState } from "react";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const iconColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "success");
  const dangerColor = useThemeColor({}, "danger");

  const { scriptUrl, setScriptUrl, clearScriptUrl } = useScriptUrl();
  const { availableCalendars, selectedCalendars, primaryCalendar, isLoadingCalendars, fetchCalendarList, setSelectedCalendars, setPrimaryCalendar } = useCalendars();
  const [inputUrl, setInputUrl] = useState(scriptUrl || "");
  const [showInput, setShowInput] = useState(false);
  const [isFetchingCalendars, setIsFetchingCalendars] = useState(false);

  const isDarkMode = colorScheme === "dark";

  const toggleTheme = () => {
    Appearance.setColorScheme(isDarkMode ? "light" : "dark");
  };

  const handleSaveUrl = async () => {
    if (!inputUrl.trim()) {
      return;
    }
    await setScriptUrl(inputUrl);
    setShowInput(false);
  };

  const handleClearUrl = async () => {
    await clearScriptUrl();
    setInputUrl("");
    setShowInput(false);
  };

  const openScriptUrl = () => {
    if (scriptUrl) {
      Linking.openURL(scriptUrl);
    }
  };

  useEffect(() => {
    if (!scriptUrl) return;
    if (availableCalendars.length > 0) return;

    const loadCalendars = async () => {
      setIsFetchingCalendars(true);
      await fetchCalendarList();
      setIsFetchingCalendars(false);
    };

    loadCalendars();
  }, [availableCalendars.length, fetchCalendarList, scriptUrl]);

  const handleRefreshCalendars = async () => {
    if (!scriptUrl) return;
    setIsFetchingCalendars(true);
    await fetchCalendarList();
    setIsFetchingCalendars(false);
  };

  const toggleCalendarSelection = async (id: string) => {
    const isSelected = selectedCalendars.includes(id);
    const nextSelected = isSelected ? selectedCalendars.filter((calId) => calId !== id) : [...selectedCalendars, id];

    await setSelectedCalendars(nextSelected);

    if (primaryCalendar === id && nextSelected.length > 0) {
      await setPrimaryCalendar(nextSelected[0]);
    }

    if (nextSelected.length === 0) {
      await setPrimaryCalendar(null);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.container}>
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
              Settings
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.section, { borderBottomColor: borderColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Appearance
            </ThemedText>
            <ThemedView style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <IconSymbol name="pencil" size={20} color={iconColor} />
                <ThemedText style={styles.settingText}>Dark Mode</ThemedText>
              </View>
              <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: "#767577", true: tintColor }} thumbColor={Platform.OS === "ios" ? undefined : "#f4f3f4"} />
            </ThemedView>
          </ThemedView>

          <ThemedView style={[styles.section, { borderBottomColor: borderColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Backend
            </ThemedText>
            {!showInput ? (
              <TouchableOpacity style={styles.settingRow} onPress={openScriptUrl}>
                <View style={styles.settingLabel}>
                  <IconSymbol name="plus" size={20} color={iconColor} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.settingText}>Script Web App</ThemedText>
                    <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{scriptUrl ? "Configured ✅" : "Missing ❌"}</ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setInputUrl(scriptUrl || "");
                    setShowInput(true);
                  }}
                >
                  <ThemedText style={{ color: tintColor, fontSize: 14 }}>Edit</ThemedText>
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              <View style={styles.inputSection}>
                <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                  Apps Script URL
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, backgroundColor, borderColor }]}
                  placeholder="https://script.google.com/macros/s/..."
                  placeholderTextColor={iconColor}
                  value={inputUrl}
                  onChangeText={setInputUrl}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: tintColor, flex: 1 }]} onPress={handleSaveUrl}>
                    <ThemedText style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>Save</ThemedText>
                  </TouchableOpacity>
                  <View style={{ width: 10 }} />
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: dangerColor, flex: 1 }]} onPress={handleClearUrl}>
                    <ThemedText style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>Clear</ThemedText>
                  </TouchableOpacity>
                  <View style={{ width: 10 }} />
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: borderColor, flex: 1 }]} onPress={() => setShowInput(false)}>
                    <ThemedText style={{ color: textColor, fontWeight: "600", textAlign: "center" }}>Cancel</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ThemedView>

          <ThemedView style={[styles.section, { borderBottomColor: borderColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Calendars
            </ThemedText>
            {!scriptUrl ? (
              <ThemedText style={styles.helpText}>Set your Apps Script URL above to load calendars.</ThemedText>
            ) : (
              <View style={styles.calendarSection}>
                <View style={styles.calendarHeader}>
                  <ThemedText style={styles.settingText}>Available Calendars</ThemedText>
                  <TouchableOpacity onPress={handleRefreshCalendars} disabled={isFetchingCalendars || isLoadingCalendars}>
                    <ThemedText style={{ color: tintColor, fontSize: 14 }}>{isFetchingCalendars ? "Loading..." : "Refresh"}</ThemedText>
                  </TouchableOpacity>
                </View>

                {availableCalendars.length === 0 ? (
                  <ThemedText style={styles.helpText}>No calendars loaded yet.</ThemedText>
                ) : (
                  availableCalendars.map((calendar) => {
                    const isSelected = selectedCalendars.includes(calendar.id);
                    const isPrimary = primaryCalendar === calendar.id;

                    return (
                      <View key={calendar.id} style={styles.calendarRow}>
                        <TouchableOpacity style={styles.calendarRowLeft} onPress={() => toggleCalendarSelection(calendar.id)}>
                          <Checkbox value={isSelected} onValueChange={() => toggleCalendarSelection(calendar.id)} color={isSelected ? tintColor : undefined} style={styles.checkbox} />
                          <View style={{ flex: 1 }}>
                            <ThemedText style={styles.settingText}>{calendar.name || calendar.id}</ThemedText>
                            {calendar.description ? <ThemedText style={styles.helpText}>{calendar.description}</ThemedText> : null}
                          </View>
                        </TouchableOpacity>
                        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                          {isPrimary && (
                            <View style={[styles.primaryPill, { borderColor: successColor, borderWidth: 1 }]}>
                              <ThemedText style={{ color: successColor, fontSize: 12 }}>Primary</ThemedText>
                            </View>
                          )}
                          {isSelected && !isPrimary && (
                            <TouchableOpacity style={[styles.primaryBadge, { borderColor }]} onPress={() => setPrimaryCalendar(calendar.id)}>
                              <ThemedText numberOfLines={1} style={{ color: textColor, fontSize: 12 }}>
                                Set Primary
                              </ThemedText>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </ThemedView>

          <ThemedView style={[styles.section, { borderBottomColor: borderColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              About
            </ThemedText>
            <ThemedText style={styles.aboutText}>Couple Calendar is a lightweight tool for shared scheduling without the complexity of OAuth.</ThemedText>
            <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  header: {
    marginBottom: 24,
  },
  section: {
    paddingBottom: 24,
    borderBottomWidth: 2,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.6,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  versionText: {
    fontSize: 12,
    marginTop: 16,
    opacity: 0.4,
    textAlign: "center",
  },
  inputSection: {
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarSection: {
    gap: 12,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  calendarRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  primaryBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 90,
    alignItems: "center",
  },
  primaryPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  checkbox: {
    borderRadius: 6,
  },
  helpText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
