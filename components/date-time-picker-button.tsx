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
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");

  return (
    <View style={[{ gap: 8 }, style]}>
      {label && (
        <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
          {label}
        </ThemedText>
      )}
      <TouchableOpacity style={[styles.dateButton, { backgroundColor, borderColor }]} onPress={onPress} disabled={disabled}>
        <ThemedText type="defaultSemiBold" style={{ color: tintColor, fontSize: 17 }}>
          {value}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
