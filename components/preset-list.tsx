import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PRESETS, Preset } from "@/utils/preset";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

interface PresetListProps {
  onSelect: (preset: Preset) => void;
  isLoading: boolean;
}

export function PresetList({ onSelect, isLoading }: PresetListProps) {
  const tintColor = useThemeColor({}, "tint");

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsContainer}>
      {PRESETS.map((preset) => (
        <TouchableOpacity key={preset.label} style={[styles.presetChip, { backgroundColor: tintColor }, isLoading && { opacity: 0.5 }]} onPress={() => onSelect(preset)} disabled={isLoading}>
          <ThemedText style={styles.presetText}>{preset.label}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  presetsContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  presetChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  presetText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
