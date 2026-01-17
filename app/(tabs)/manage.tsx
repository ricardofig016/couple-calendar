import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { Fonts } from "@/constants/theme";

export default function ManageScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.container}>
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

          <ThemedText>Customize your experience and manage your shared calendars.</ThemedText>

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
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
