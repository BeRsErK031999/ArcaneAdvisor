import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/shared/theme/colors";

interface BackButtonProps {
  onPressOverride?: () => void;
}

export function BackButton({ onPressOverride }: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPressOverride) {
      onPressOverride();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      hitSlop={8}
    >
      <Text style={styles.backIcon}>←</Text>
      <Text style={styles.backText}>Назад</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    columnGap: 4,
    backgroundColor: colors.surface,
  },
  backButtonPressed: {
    backgroundColor: colors.surfaceElevated ?? colors.surface,
  },
  backIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  backText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
