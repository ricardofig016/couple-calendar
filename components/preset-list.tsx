import { ThemedText } from "@/components/themed-text";
import { PRESETS, Preset } from "@/utils/preset";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

interface PresetListProps {
  onSelect: (preset: Preset) => void;
  isLoading: boolean;
}

export function PresetList({ onSelect, isLoading }: PresetListProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsContainer}>
      {PRESETS.map((preset) => (
        <TouchableOpacity key={preset.label} style={[styles.presetChip, isLoading && { opacity: 0.5 }]} onPress={() => onSelect(preset)} disabled={isLoading}>
          <ThemedText style={styles.presetText}>{preset.label}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
