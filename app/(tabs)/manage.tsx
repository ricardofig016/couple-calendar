import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
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
  const router = useRouter();
  const iconColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({ light: "#e0e0e0", dark: "#333" }, "icon");

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  const handleEdit = (event: CalendarEvent) => {
    // Navigate to Add Event screen with params
    router.push({
      pathname: "/",
      params: {
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
      },
    });
  };

  const handleDelete = async (eventId: string) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!SCRIPT_URL) return;
          setIsLoading(true);
          try {
            const response = await fetch(SCRIPT_URL, {
              method: "POST",
              body: JSON.stringify({
                action: "delete",
                id: eventId,
              }),
            });
            if (response.ok) {
              fetchEvents();
            } else {
              throw new Error("Failed to delete event");
            }
          } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents(false); // Don't show full screen loader when returning
    }, [fetchEvents]),
  );

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
            <TouchableOpacity onPress={() => fetchEvents(false)} disabled={isLoading}>
              <IconSymbol name="arrow.clockwise" size={24} color={iconColor} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedText>Customize your experience and manage your shared calendars.</ThemedText>

          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Recent & Upcoming Events
            </ThemedText>
            {events.length === 0 && !isLoading ? (
              <ThemedText style={styles.emptyText}>No events found in the selected range.</ThemedText>
            ) : (
              events.map((event, index) => {
                const eventKey = event.id || `index-${index}`;
                const isExpanded = expandedEvents[eventKey];

                return (
                  <ThemedView key={eventKey} style={[styles.eventCard, { borderColor, alignItems: "flex-start" }]}>
                    <ThemedView style={styles.eventInfo}>
                      <ThemedText type="defaultSemiBold">{event.title}</ThemedText>
                      <ThemedText style={[styles.eventDate, { color: iconColor }]}>
                        {formatDate(event.start)} • {formatTime(event.start)} - {formatTime(event.end)}
                      </ThemedText>
                      {event.description ? (
                        <View style={{ marginTop: 4 }}>
                          <ThemedText numberOfLines={isExpanded ? undefined : 2} style={[styles.eventDescription, { color: iconColor }]}>
                            {event.description.replace(/<[^>]*>?/gm, "")}
                          </ThemedText>
                        </View>
                      ) : null}
                    </ThemedView>
                    <View style={styles.eventActions}>
                      <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(event)} disabled={isLoading}>
                        <IconSymbol name="pencil" size={20} color={iconColor} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(event.id)} disabled={isLoading}>
                        <IconSymbol name="trash" size={20} color={iconColor} />
                      </TouchableOpacity>
                      {event.description ? (
                        <TouchableOpacity style={styles.actionButton} onPress={() => toggleExpand(eventKey)}>
                          <IconSymbol name={isExpanded ? "chevron.up" : "chevron.down"} size={20} color={iconColor} />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </ThemedView>
                );
              })
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventInfo: {
    gap: 2,
    flex: 1,
  },
  eventActions: {
    flexDirection: "column",
    gap: 4,
    marginLeft: 12,
  },
  actionButton: {
    padding: 4,
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
