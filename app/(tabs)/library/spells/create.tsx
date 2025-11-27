import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { SpellForm } from "@/features/spells/components/SpellForm";
import { NoSourcesForSpells } from "@/features/spells/components/NoSourcesForSpells";
import { getSpellSchools } from "@/features/spells/api/getSpellSchools";
import type { SpellSchoolId } from "@/features/spells/api/types";
import { getSources } from "@/features/sources/api/getSources";
import type { Source } from "@/features/sources/api/types";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText } from "@/shared/ui/Typography";
import { colors } from "@/shared/theme/colors";

export default function SpellCreateScreen() {
  const router = useRouter();

  const {
    data: sources,
    isLoading: isLoadingSources,
    isError: isErrorSources,
    error: errorSources,
    refetch: refetchSources,
  } = useQuery<Source[], Error>({
    queryKey: ["sources"],
    queryFn: getSources,
  });

  const {
    data: schools,
    isLoading: isLoadingSchools,
    isError: isErrorSchools,
    error: errorSchools,
    refetch: refetchSchools,
  } = useQuery<SpellSchoolId[], Error>({
    queryKey: ["spellSchools"],
    queryFn: getSpellSchools,
  });

  const isLoadingAll = isLoadingSources || isLoadingSchools;

  if (isLoadingAll) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю данные…</BodyText>
      </ScreenContainer>
    );
  }

  if (isErrorSources || isErrorSchools) {
    const combinedErrorMessage = errorSources?.message ?? errorSchools?.message;
    const handleRetry = () => {
      refetchSources();
      refetchSchools();
    };

    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>
          Не удалось загрузить данные
        </BodyText>
        {combinedErrorMessage ? (
          <BodyText style={styles.errorDetails}>{combinedErrorMessage}</BodyText>
        ) : null}
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  const hasSources = (sources ?? []).length > 0;
  const hasSchools = (schools ?? []).length > 0;

  if (!hasSources) {
    return <NoSourcesForSpells />;
  }

  if (!hasSchools) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={styles.helperText}>
          Не удалось загрузить список школ заклинаний.
        </BodyText>
        <Pressable style={styles.retryButton} onPress={() => refetchSchools()}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <SpellForm
      mode="create"
      sources={sources}
      schools={schools}
      submitLabel="Создать заклинание"
      showBackButton
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
