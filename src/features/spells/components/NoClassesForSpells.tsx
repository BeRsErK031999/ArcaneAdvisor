import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Link } from "expo-router";

import { colors } from "@/shared/theme/colors";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText, TitleText } from "@/shared/ui/Typography";

export function NoClassesForSpells() {
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
          <Link href="/(tabs)/library/classes/create" asChild>
            <Pressable style={[styles.button, styles.primaryButton]}>
              <BodyText style={styles.primaryButtonText}>Создать класс</BodyText>
            </Pressable>
          </Link>

          <Link href="/(tabs)/library/classes" asChild>
            <Pressable style={styles.button}>
              <BodyText style={styles.buttonText}>Открыть классы</BodyText>
            </Pressable>
          </Link>
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
    gap: 12,
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
