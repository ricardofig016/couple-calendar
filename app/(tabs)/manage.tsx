import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

// Using environment variable for security
const SCRIPT_URL = process.env.EXPO_PUBLIC_SCRIPT_URL;

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
}

export default function ManageScreen() {
  const iconColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({ light: "#e0e0e0", dark: "#333" }, "icon");

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEvents = useCallback(async (showLoading = true) => {
    if (!SCRIPT_URL) {
      Alert.alert("Error", "Script URL is not configured");
      return;
    }

    if (showLoading) setIsLoading(true);

    try {
      const response = await fetch(SCRIPT_URL);
      const text = await response.text();

      if (response.ok) {
        try {
          const data = JSON.parse(text);
          setEvents(data);
        } catch (e) {
          console.error("Failed to parse JSON:", text.substring(0, 100));
          throw new Error("Backend returned HTML instead of JSON. Ensure your Google Apps Script is deployed correctly with a doGet function and 'Who has access: Anyone'.");
        }
      } else {
        throw new Error("Failed to fetch events: " + response.status);
      }
    } catch (error) {
      console.error(error);
      if (showLoading) {
        Alert.alert("Error", "Could not load events. Make sure your Google Apps Script is updated with a doGet function.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchEvents(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={tintColor} />}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText
                type="title"
                style={{
                  fontFamily: Fonts.rounded,
                }}
              >
                Manage
              </ThemedText>
            </ThemedView>
            <TouchableOpacity onPress={() => fetchEvents()} disabled={isLoading}>
              <IconSymbol name="arrow.clockwise" size={24} color={iconColor} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedText>Customize your experience and manage your shared calendars.</ThemedText>

          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Recent & Upcoming Events
            </ThemedText>
            {isLoading && !isRefreshing ? (
              <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 20 }} />
            ) : events.length === 0 ? (
              <ThemedText style={styles.emptyText}>No events found in the selected range.</ThemedText>
            ) : (
              events.map((event, index) => (
                <ThemedView key={event.id || index} style={[styles.eventCard, { borderColor }]}>
                  <ThemedView style={styles.eventInfo}>
                    <ThemedText type="defaultSemiBold">{event.title}</ThemedText>
                    <ThemedText style={[styles.eventDate, { color: iconColor }]}>
                      {formatDate(event.start)} • {formatTime(event.start)} - {formatTime(event.end)}
                    </ThemedText>
                    {event.description ? (
                      <ThemedText numberOfLines={2} style={[styles.eventDescription, { color: iconColor }]}>
                        {event.description.replace(/<[^>]*>?/gm, "")}
                      </ThemedText>
                    ) : null}
                  </ThemedView>
                </ThemedView>
              ))
            )}
          </ThemedView>

          <ThemedView style={[styles.divider, { backgroundColor: borderColor }]} />

          <Collapsible title="Mystery Date Generator">
            <ThemedText>Coming Soon! A button that picks a random date idea from a pre-defined list and schedules it at a time both are free.</ThemedText>
          </Collapsible>

          <Collapsible title="Relationship Milestones">
            <ThemedText>Coming Soon! A section showing days until your next big event or anniversary.</ThemedText>
          </Collapsible>

          <Collapsible title="Mood Picker & Style">
            <ThemedText>Select &quot;Vibes&quot; for your events to automatically change colors or description styles.</ThemedText>
          </Collapsible>

          <Collapsible title="Shared Checklists">
            <ThemedText>Integrate mini-checklists for &quot;Shopping&quot; or &quot;Trip&quot; presets directly into your calendar events.</ThemedText>
          </Collapsible>
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
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  eventCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  eventInfo: {
    gap: 2,
  },
  eventDate: {
    fontSize: 14,
  },
  eventDescription: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.6,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});
