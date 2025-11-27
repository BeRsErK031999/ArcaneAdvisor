import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { SpellForm } from "@/features/spells/components/SpellForm";
import { NoSourcesForSpells } from "@/features/spells/components/NoSourcesForSpells";
import { getSources } from "@/features/sources/api/getSources";
import type { Source } from "@/features/sources/api/types";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText } from "@/shared/ui/Typography";
import { colors } from "@/shared/theme/colors";

export default function SpellCreateScreen() {
  const router = useRouter();

  const { data: sources, isLoading, isError, error, refetch } = useQuery<
    Source[],
    Error
  >({
    queryKey: ["sources"],
    queryFn: getSources,
  });

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю источники…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>
          Не удалось загрузить источники
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

  const hasSources = (sources ?? []).length > 0;

  if (!hasSources) {
    return <NoSourcesForSpells />;
  }

  return (
    <SpellForm
      mode="create"
      sources={sources}
      submitLabel="Создать заклинание"
      onSuccess={() => {
        router.replace("/(tabs)/library/spells");
      }}
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
