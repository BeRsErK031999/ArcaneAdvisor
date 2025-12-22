// app/(tabs)/library/spells/[spellId]/edit.tsx
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { getSpellById } from "@/features/spells/api/getSpellById";
import type { Spell, SpellCreateInput } from "@/features/spells/api/types";
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
import { colors } from "@/shared/theme/colors";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText } from "@/shared/ui/Typography";

const mapSpellToFormValues = (spell: Spell): SpellCreateInput => ({
  class_ids: spell.class_ids ?? [],
  subclass_ids: spell.subclass_ids ?? [],
  name: spell.name,
  description: spell.description,
  next_level_description: spell.next_level_description ?? "",
  level: spell.level,
  school: spell.school,
  damage_type: { name: spell.damage_type?.name ?? null },
  duration: { game_time: spell.duration?.game_time ?? null },
  casting_time: spell.casting_time,
  spell_range: spell.spell_range,
  splash: { splash: spell.splash?.splash ?? null },
  components: spell.components,
  concentration: spell.concentration,
  ritual: spell.ritual,
  saving_throws: spell.saving_throws ?? [],
  name_in_english: spell.name_in_english,
  source_id: spell.source_id,
});

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

  const spellQuery = useQuery<Spell, Error>({
    queryKey: ["spells", spellId ?? "unknown-spell"],
    queryFn: () => getSpellById(spellId as string),
    enabled: Boolean(spellId),
  });

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

  if (!spellId) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Не указан идентификатор заклинания.</BodyText>
      </ScreenContainer>
    );
  }

  const isLoadingAll =
    spellQuery.isLoading ||
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
    spellQuery.isError ||
    sourcesQuery.isError ||
    classesQuery.isError ||
    subclassesQuery.isError ||
    materialComponentsQuery.isError ||
    modifiersQuery.isError ||
    damageTypesQuery.isError;

  if (hasError || !spellQuery.data) {
    console.error("Error loading spell for edit:", spellQuery.error);
    const combinedErrorMessage =
      spellQuery.error?.message ||
      sourcesQuery.error?.message ||
      classesQuery.error?.message ||
      subclassesQuery.error?.message ||
      materialComponentsQuery.error?.message ||
      modifiersQuery.error?.message ||
      damageTypesQuery.error?.message;

    const handleRefetch = () => {
      spellQuery.refetch();
      sourcesQuery.refetch();
      classesQuery.refetch();
      subclassesQuery.refetch();
      materialComponentsQuery.refetch();
      modifiersQuery.refetch();
      damageTypesQuery.refetch();
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

  const hasSources = (sourcesQuery.data ?? []).length > 0;
  const hasClasses = (classesQuery.data ?? []).length > 0;

  if (!hasSources) {
    return <NoSourcesForSpells />;
  }

  if (!hasClasses) {
    return <NoClassesForSpells />;
  }

  const initialValues = mapSpellToFormValues(spellQuery.data);

  return (
    <SpellForm
      mode="edit"
      spellId={spellId}
      initialValues={initialValues}
      sources={sourcesQuery.data}
      classes={classesQuery.data}
      subclasses={subclassesQuery.data}
      materialComponents={materialComponentsQuery.data}
      modifiers={modifiersQuery.data}
      damageTypes={damageTypesQuery.data}
      showBackButton
      onSuccess={(id) => {
        router.replace({
          pathname: "/(tabs)/library/spells/[spellId]",
          params: { spellId: id },
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
