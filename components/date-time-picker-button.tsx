import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface DateTimePickerButtonProps {
  label?: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

export function DateTimePickerButton({ label, value, onPress, disabled, style }: DateTimePickerButtonProps) {
  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icon");

  return (
    <View style={[{ gap: 12 }, style]}>
      {label && <ThemedText type="defaultSemiBold">{label}</ThemedText>}
      <TouchableOpacity style={[styles.dateButton, { backgroundColor, borderColor: iconColor }]} onPress={onPress} disabled={disabled}>
        <ThemedText type="defaultSemiBold">{value}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
});
