// src/features/spells/components/NoClassesForSpells.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/shared/theme/colors";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText, TitleText } from "@/shared/ui/Typography";

export function NoClassesForSpells() {
  const router = useRouter();

  const handleCreateClass = () => {
    router.push("/(tabs)/library/classes/create");
  };

  const handleOpenClasses = () => {
    router.push("/(tabs)/library/classes");
  };

  return (
    <ScreenContainer>
      <View style={styles.centered}>
        <TitleText>Нужно создать класс</TitleText>

        <BodyText style={styles.helperText}>
          Заклинание должно быть привязано хотя бы к одному классу. Создайте
          класс, чтобы продолжить.
        </BodyText>

        <BodyText style={styles.helperTextSecondary}>
          После создания вы сможете выбрать класс по названию без ручного ввода
          UUID.
        </BodyText>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCreateClass}
          >
            <BodyText style={styles.primaryButtonText}>Создать класс</BodyText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleOpenClasses}
          >
            <BodyText style={styles.buttonText}>Открыть классы</BodyText>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    rowGap: 16,
  },
  helperText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  helperTextSecondary: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    columnGap: 12,
    rowGap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: colors.buttonPrimary,
    borderColor: colors.buttonPrimary,
  },
  primaryButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: "700",
  },
});
