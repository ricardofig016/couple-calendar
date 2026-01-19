import { Appearance, Linking, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const iconColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  const isDarkMode = colorScheme === "dark";

  const toggleTheme = () => {
    Appearance.setColorScheme(isDarkMode ? "light" : "dark");
  };

  const openScriptUrl = () => {
    const url = process.env.EXPO_PUBLIC_SCRIPT_URL;
    if (url) {
      Linking.openURL(url);
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
            <TouchableOpacity style={styles.settingRow} onPress={openScriptUrl}>
              <View style={styles.settingLabel}>
                <IconSymbol name="plus" size={20} color={iconColor} />
                <ThemedText style={styles.settingText}>Script Web App Status</ThemedText>
              </View>
              <ThemedText style={{ color: tintColor, fontSize: 14 }}>{process.env.EXPO_PUBLIC_SCRIPT_URL ? "Configured ✅" : "Missing ❌"}</ThemedText>
            </TouchableOpacity>
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
});
