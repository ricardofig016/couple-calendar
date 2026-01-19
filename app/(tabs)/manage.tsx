import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { CalendarEvent, useEvents } from "@/context/event-context";
import { useThemeColor } from "@/hooks/use-theme-color";

// Using environment variable for security
const SCRIPT_URL = process.env.EXPO_PUBLIC_SCRIPT_URL;

export default function ManageScreen() {
  const router = useRouter();
  const iconColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");
  const successColor = useThemeColor({}, "success");

  const { events, isLoading: isGlobalLoading, refreshEvents } = useEvents();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [canExpand, setCanExpand] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
              refreshEvents();
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

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshEvents(false);
    setIsRefreshing(false);
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

  const getEventState = (startStr: string, endStr: string) => {
    const now = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (now > end) return "finished";
    if (now >= start && now <= end) return "in-progress";
    return "upcoming";
  };

  const getEventDateText = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const isMultiDay = start.toDateString() !== end.toDateString();

    const isAllDay = start.getHours() === 0 && start.getMinutes() === 0 && ((end.getHours() === 23 && end.getMinutes() === 59) || (end.getHours() === 0 && end.getMinutes() === 0 && isMultiDay));

    const dateA = formatDate(event.start);
    const timeA = formatTime(event.start);
    const dateB = formatDate(event.end);
    const timeB = formatTime(event.end);

    if (!isMultiDay) {
      if (isAllDay) return `${dateA} • All day`;
      return `${dateA} • ${timeA} - ${timeB}`;
    }

    if (isAllDay) return `${dateA} - ${dateB}`;
    return `${dateA}, ${timeA} - ${dateB}, ${timeB}`;
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
            <TouchableOpacity onPress={() => refreshEvents(false)} disabled={isGlobalLoading || isLoading}>
              <IconSymbol name="arrow.clockwise" size={24} color={tintColor} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Recent & Upcoming Events 🎈
            </ThemedText>
            {events.length === 0 && !isGlobalLoading && !isLoading ? (
              <ThemedText style={styles.emptyText}>No events found in the selected range.</ThemedText>
            ) : (
              events.map((event, index) => {
                const eventKey = event.id || `index-${index}`;
                const isExpanded = expandedEvents[eventKey];
                const state = getEventState(event.start, event.end);

                return (
                  <ThemedView
                    key={eventKey}
                    style={[
                      styles.eventCard,
                      { borderColor, alignItems: "flex-start" },
                      state === "finished" && { opacity: 0.5, backgroundColor: "rgba(0,0,0,0.02)" },
                      state === "in-progress" && { borderColor: successColor, borderWidth: 2, backgroundColor: `${successColor}10` },
                    ]}
                  >
                    <ThemedView style={[styles.eventInfo, { backgroundColor: "transparent" }]}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <ThemedText type="defaultSemiBold" style={[state === "finished" && { textDecorationLine: "line-through" }, { fontSize: 17 }]}>
                          {event.title}
                        </ThemedText>
                        {state === "in-progress" && (
                          <View style={{ backgroundColor: successColor, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                            <ThemedText style={{ color: "white", fontSize: 10, fontWeight: "800" }}>LIVE ✨</ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText style={[styles.eventDate, { color: iconColor }]}>{getEventDateText(event)}</ThemedText>
                      {event.description ? (
                        <View style={{ marginTop: 4 }}>
                          {/* Hidden measurer to detect if description should have an expand button */}
                          <ThemedText
                            style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                            onTextLayout={(e) => {
                              if (e.nativeEvent.lines.length > 2 && !canExpand[eventKey]) {
                                setCanExpand((prev) => ({ ...prev, [eventKey]: true }));
                              }
                            }}
                          >
                            {event.description.replace(/<[^>]*>?/gm, "")}
                          </ThemedText>
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
                      {canExpand[eventKey] ? (
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
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    marginBottom: 16,
  },
  eventCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventInfo: {
    gap: 4,
    flex: 1,
  },
  eventActions: {
    flexDirection: "column",
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 6,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  eventDescription: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 18,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    opacity: 0.6,
    fontSize: 16,
  },
  divider: {
    height: 2,
    marginVertical: 16,
    borderRadius: 1,
  },
});
