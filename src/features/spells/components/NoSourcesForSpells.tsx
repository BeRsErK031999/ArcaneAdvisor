import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Link } from "expo-router";

import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText, TitleText } from "@/shared/ui/Typography";
import { colors } from "@/shared/theme/colors";

export function NoSourcesForSpells() {
  return (
    <ScreenContainer>
      <View style={styles.centered}>
        <TitleText>Нужно создать источник</TitleText>

        <BodyText style={styles.helperText}>
          Прежде чем добавлять заклинания, создайте хотя бы один источник
          (например, &quot;Книга игрока&quot;).
        </BodyText>

        <BodyText style={styles.helperTextSecondary}>
          Источник — это книга или набор данных, к которому будет привязано
          заклинание. Без источника сервер не принимает новые заклинания.
        </BodyText>

        <Link href="/(tabs)/library/sources" asChild>
          <Pressable style={styles.button}>
            <BodyText style={styles.buttonText}>
              Перейти к источникам
            </BodyText>
          </Pressable>
        </Link>
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
  button: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
  },
  buttonText: {
    color: colors.buttonPrimaryText,
    fontWeight: "600",
  },
});
