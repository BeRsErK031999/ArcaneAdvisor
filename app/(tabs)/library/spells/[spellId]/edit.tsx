// app/(tabs)/library/spells/[spellId]/edit.tsx
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { getSpellById } from "@/features/spells/api/getSpellById";
import type { Spell, SpellCreateInput } from "@/features/spells/api/types";
import { SpellForm } from "@/features/spells/components/SpellForm";
import { getSources } from "@/features/sources/api/getSources";
import type { Source } from "@/features/sources/api/types";
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

  const {
    data: spell,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Spell, Error>({
    queryKey: ["spells", spellId ?? "unknown-spell"],
    queryFn: () => getSpellById(spellId as string),
    enabled: Boolean(spellId),
  });

  const {
    data: sources,
    isLoading: isSourcesLoading,
    isError: isSourcesError,
    error: sourcesError,
    refetch: refetchSources,
  } = useQuery<Source[], Error>({
    queryKey: ["sources"],
    queryFn: getSources,
  });

  if (!spellId) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Не указан идентификатор заклинания.</BodyText>
      </ScreenContainer>
    );
  }

  if (isLoading || isSourcesLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю данные…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError || isSourcesError || !spell) {
    console.error("Error loading spell for edit:", error ?? sourcesError);
    const combinedErrorMessage = sourcesError?.message ?? error?.message;
    const handleRefetch = () => {
      refetch();
      refetchSources();
    };

    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={styles.errorText}>
          Не удалось загрузить заклинание для редактирования.
        </BodyText>
        {combinedErrorMessage ? (
          <BodyText style={styles.errorDetails}>{combinedErrorMessage}</BodyText>
        ) : null}

        <Pressable style={styles.retryButton} onPress={handleRefetch}>
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
      sources={sources}
      showBackButton
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
