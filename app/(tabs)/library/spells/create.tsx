import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { SpellForm } from "@/features/spells/components/SpellForm";
import { NoSourcesForSpells } from "@/features/spells/components/NoSourcesForSpells";
import { NoClassesForSpells } from "@/features/spells/components/NoClassesForSpells";
import { getSources } from "@/features/sources/api/getSources";
import type { Source } from "@/features/sources/api/types";
import { getClasses } from "@/features/classes/api/getClasses";
import type { Class } from "@/features/classes/api/types";
import { getSubclasses } from "@/features/subclasses/api/getSubclasses";
import type { Subclass } from "@/features/subclasses/api/types";
import { getMaterialComponents } from "@/features/material-components/api/getMaterialComponents";
import type { MaterialComponent } from "@/features/material-components/api/types";
import { getModifiers } from "@/features/dictionaries/api/getModifiers";
import { getDamageTypes } from "@/features/dictionaries/api/getDamageTypes";
import type { DamageTypesResponse, Modifiers } from "@/features/dictionaries/api/types";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText } from "@/shared/ui/Typography";
import { colors } from "@/shared/theme/colors";

export default function SpellCreateScreen() {
  const router = useRouter();

  const sourcesQuery = useQuery<Source[], Error>({
    queryKey: ["sources"],
    queryFn: getSources,
  });

  const classesQuery = useQuery<Class[], Error>({
    queryKey: ["classes"],
    queryFn: getClasses,
  });

  const subclassesQuery = useQuery<Subclass[], Error>({
    queryKey: ["subclasses"],
    queryFn: getSubclasses,
  });

  const materialComponentsQuery = useQuery<MaterialComponent[], Error>({
    queryKey: ["material-components"],
    queryFn: getMaterialComponents,
  });

  const modifiersQuery = useQuery<Modifiers, Error>({
    queryKey: ["modifiers"],
    queryFn: getModifiers,
  });

  const damageTypesQuery = useQuery<DamageTypesResponse, Error>({
    queryKey: ["damage-types"],
    queryFn: getDamageTypes,
  });

  const isLoadingAll =
    sourcesQuery.isLoading ||
    classesQuery.isLoading ||
    subclassesQuery.isLoading ||
    materialComponentsQuery.isLoading ||
    modifiersQuery.isLoading ||
    damageTypesQuery.isLoading;

  if (isLoadingAll) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю данные…</BodyText>
      </ScreenContainer>
    );
  }

  const hasError =
    sourcesQuery.isError ||
    classesQuery.isError ||
    subclassesQuery.isError ||
    materialComponentsQuery.isError ||
    modifiersQuery.isError ||
    damageTypesQuery.isError;

  if (hasError) {
    const combinedErrorMessage =
      sourcesQuery.error?.message ||
      classesQuery.error?.message ||
      subclassesQuery.error?.message ||
      materialComponentsQuery.error?.message ||
      modifiersQuery.error?.message ||
      damageTypesQuery.error?.message;
    const handleRetry = () => {
      sourcesQuery.refetch();
      classesQuery.refetch();
      subclassesQuery.refetch();
      materialComponentsQuery.refetch();
      modifiersQuery.refetch();
      damageTypesQuery.refetch();
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

  const hasSources = (sourcesQuery.data ?? []).length > 0;
  const hasClasses = (classesQuery.data ?? []).length > 0;

  if (!hasSources) {
    return <NoSourcesForSpells />;
  }

  if (!hasClasses) {
    return <NoClassesForSpells />;
  }

  return (
    <SpellForm
      mode="create"
      sources={sourcesQuery.data}
      classes={classesQuery.data}
      subclasses={subclassesQuery.data}
      materialComponents={materialComponentsQuery.data}
      modifiers={modifiersQuery.data}
      damageTypes={damageTypesQuery.data}
      submitLabel="Создать заклинание"
      showBackButton
      onSuccess={(spellId) => {
        router.replace({
          pathname: "/(tabs)/library/spells/[spellId]",
          params: { spellId },
        });
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
