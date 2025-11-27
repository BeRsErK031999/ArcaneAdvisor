// app/(tabs)/library/spells/[spellId]/edit.tsx
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { getSpellById } from "@/features/spells/api/getSpellById";
import type { Spell, SpellCreateInput } from "@/features/spells/api/types";
import { SpellForm } from "@/features/spells/components/SpellForm";
import { colors } from "@/shared/theme/colors";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText } from "@/shared/ui/Typography";

export default function SpellEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ spellId?: string | string[] }>();

  const spellIdParam = params.spellId;
  const spellId =
    typeof spellIdParam === "string"
      ? spellIdParam
      : Array.isArray(spellIdParam)
      ? spellIdParam[0]
      : undefined;

  if (!spellId) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Не указан идентификатор заклинания.</BodyText>
      </ScreenContainer>
    );
  }

  const {
    data: spell,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Spell, Error>({
    queryKey: ["spells", spellId],
    queryFn: () => getSpellById(spellId),
  });

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю заклинание…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError || !spell) {
    console.error("Error loading spell for edit:", error);
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={styles.errorText}>
          Не удалось загрузить заклинание для редактирования.
        </BodyText>
        {error?.message ? (
          <BodyText style={styles.errorDetails}>{error.message}</BodyText>
        ) : null}

        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  const initialValues = spell as SpellCreateInput; // позже можно заменить на явный маппер

  return (
    <SpellForm
      mode="edit"
      spellId={spellId}
      initialValues={initialValues}
      onSuccess={() => {
        router.replace({
          pathname: "/(tabs)/library/spells/[spellId]",
          params: { spellId },
        });
      }}
      submitLabel="Сохранить изменения"
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 12,
  },
  helperText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  errorText: {
    color: colors.error,
    fontWeight: "600",
    textAlign: "center",
  },
  errorDetails: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  retryButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: "500",
  },
});
