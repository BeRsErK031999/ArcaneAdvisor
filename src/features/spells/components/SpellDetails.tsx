// src/features/spells/components/SpellDetails.tsx
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { getSpellById } from "@/features/spells/api/getSpellById";
import { deleteSpell } from "@/features/spells/api/deleteSpell";
import type { Spell } from "@/features/spells/api/types";
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
import { BodyText, TitleText } from "@/shared/ui/Typography";
import { BackButton } from "@/shared/ui/BackButton";

interface SpellDetailsProps {
  spellId: string;
}

export function SpellDetails({ spellId }: SpellDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const classesQuery = useQuery<Class[], Error>({
    queryKey: ["classes"],
    queryFn: getClasses,
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

  const subclassQueries = useQueries<UseQueryResult<Subclass[], Error>[]>({
    queries: React.useMemo(
      () =>
        (spell?.class_ids ?? []).map((classId) => ({
          queryKey: ["subclasses", classId],
          queryFn: () => getSubclasses({ filter_by_class_id: classId }),
          enabled: Boolean(classId),
        })),
      [spell?.class_ids],
    ),
  });

  const classNameMap = React.useMemo(() => {
    if (!classesQuery.data) {
      return new Map<string, string>();
    }
    return new Map(classesQuery.data.map((classItem) => [classItem.class_id, classItem.name]));
  }, [classesQuery.data]);

  const subclassNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    subclassQueries.forEach((query) => {
      query.data?.forEach((subclass) => {
        map.set(subclass.subclass_id, subclass.name);
      });
    });
    return map;
  }, [subclassQueries]);

  const materialComponentsMap = React.useMemo(() => {
    if (!materialComponentsQuery.data) {
      return new Map<string, string>();
    }
    return new Map(
      materialComponentsQuery.data.map((component) => [
        component.material_component_id,
        component.name,
      ]),
    );
  }, [materialComponentsQuery.data]);

  const modifiersMap = React.useMemo(() => {
    if (!modifiersQuery.data) {
      return new Map<string, string>();
    }
    return new Map(Object.entries(modifiersQuery.data));
  }, [modifiersQuery.data]);

  const damageTypesMap = React.useMemo(() => {
    if (!damageTypesQuery.data) {
      return new Map<string, string>();
    }
    return new Map(Object.entries(damageTypesQuery.data));
  }, [damageTypesQuery.data]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteSpell(spellId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spells"] });
      queryClient.removeQueries({ queryKey: ["spells", spellId] });
      router.back();
    },
  });

  // Состояние загрузки
  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю заклинание…</BodyText>
      </ScreenContainer>
    );
  }

  // Состояние ошибки
  if (isError) {
    console.error("Failed to load spell:", error);
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>
          Ошибка при загрузке заклинания
        </BodyText>
        <BodyText style={styles.errorDetails}>
          {error?.message ?? "Неизвестная ошибка"}
        </BodyText>

        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!spell) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Заклинание не найдено.</BodyText>
      </ScreenContainer>
    );
  }

  const renderComponents = () => {
    const parts: string[] = [];
    if (spell.components.verbal) parts.push("V");
    if (spell.components.symbolic) parts.push("S");

    if (spell.components.material) {
      parts.push("M");
      if (spell.components.materials.length > 0) {
        const materialNames = spell.components.materials
          .map((materialId) => materialComponentsMap.get(materialId))
          .filter(Boolean) as string[];

        if (materialNames.length > 0) {
          parts.push(`Материальные: ${materialNames.join(", ")}`);
        } else {
          parts.push("Материальные: названия недоступны");
        }
      }
    }

    return parts.length > 0 ? parts.join(", ") : "—";
  };

  const renderDuration = () => {
    if (!spell.duration || !spell.duration.game_time) {
      return "Мгновенно";
    }
    const { count, unit } = spell.duration.game_time;
    return `${count} ${unit}`;
  };

  const renderSplash = () => {
    if (!spell.splash || !spell.splash.splash) {
      return null;
    }
    const { count, unit } = spell.splash.splash;
    return `${count} ${unit}`;
  };

  const savingThrowsLabel = React.useMemo(() => {
    if (!spell.saving_throws || spell.saving_throws.length === 0) {
      return "—";
    }

    return spell.saving_throws
      .map((save) => modifiersMap.get(save) ?? save)
      .join(", ");
  }, [modifiersMap, spell.saving_throws]);

  const damageTypeLabel = React.useMemo(() => {
    const damageTypeName = spell.damage_type?.name;
    if (!damageTypeName) {
      return null;
    }

    return damageTypesMap.get(damageTypeName) ?? damageTypeName;
  }, [damageTypesMap, spell.damage_type?.name]);

  const classNames = React.useMemo(
    () =>
      (spell.class_ids ?? []).map(
        (classId) => classNameMap.get(classId) ?? "Название класса недоступно",
      ),
    [classNameMap, spell.class_ids],
  );

  const subclassNames = React.useMemo(
    () =>
      (spell.subclass_ids ?? []).map(
        (subclassId) =>
          subclassNameMap.get(subclassId) ?? "Название подкласса недоступно",
      ),
    [spell.subclass_ids, subclassNameMap],
  );

  const isLoadingSubclasses = subclassQueries.some(
    (query) => query.isLoading || query.isFetching,
  );
  const hasSubclassError = subclassQueries.some((query) => query.isError);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <BackButton />
          <TitleText style={styles.title}>{spell.name}</TitleText>
        </View>
        {spell.name_in_english ? (
          <BodyText style={styles.spellNameEn}>
            {spell.name_in_english}
          </BodyText>
        ) : null}
        <BodyText style={styles.spellMeta}>
          Уровень {spell.level}, школа: {spell.school}
        </BodyText>

        {/* Действия */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/library/spells/[spellId]/edit",
                params: { spellId: spell.spell_id },
              })
            }
            style={styles.editButton}
            disabled={deleteMutation.isPending}
          >
            <BodyText style={styles.editButtonText}>Редактировать</BodyText>
          </Pressable>

          <Pressable
            onPress={() =>
              Alert.alert(
                "Удалить заклинание?",
                "Действие нельзя отменить.",
                [
                  { text: "Отмена", style: "cancel" },
                  {
                    text: "Удалить",
                    style: "destructive",
                    onPress: () => deleteMutation.mutate(),
                  },
                ],
              )
            }
            style={[styles.deleteButton, deleteMutation.isPending && styles.deleteButtonDisabled]}
            disabled={deleteMutation.isPending}
          >
            <BodyText style={styles.deleteButtonText}>
              {deleteMutation.isPending ? "Удаляю…" : "Удалить"}
            </BodyText>
          </Pressable>
        </View>
        {deleteMutation.isError ? (
          <BodyText style={styles.errorText}>
            Не удалось удалить заклинание. Попробуйте ещё раз.
          </BodyText>
        ) : null}

        {/* Основные параметры каста */}
        <View style={styles.block}>
          <BodyText style={styles.blockTitle}>Параметры заклинания</BodyText>
          <BodyText>
            <BodyText style={styles.labelText}>Время каста: </BodyText>
            {spell.casting_time.count} {spell.casting_time.unit}
          </BodyText>
          <BodyText>
            <BodyText style={styles.labelText}>Дистанция: </BodyText>
            {spell.spell_range.count} {spell.spell_range.unit}
          </BodyText>
          <BodyText>
            <BodyText style={styles.labelText}>Длительность: </BodyText>
            {renderDuration()}
          </BodyText>
          {renderSplash() ? (
            <BodyText>
              <BodyText style={styles.labelText}>Область: </BodyText>
              {renderSplash()}
            </BodyText>
          ) : null}
          <BodyText>
            <BodyText style={styles.labelText}>Концентрация: </BodyText>
            {spell.concentration ? "да" : "нет"}
          </BodyText>
          <BodyText>
            <BodyText style={styles.labelText}>Ритуал: </BodyText>
            {spell.ritual ? "да" : "нет"}
          </BodyText>
        </View>

        {/* Компоненты */}
        <View style={styles.block}>
          <BodyText style={styles.blockTitle}>Компоненты</BodyText>
          <BodyText>{renderComponents()}</BodyText>
        </View>

        <View style={styles.block}>
          <BodyText style={styles.blockTitle}>Сейвы</BodyText>
          <BodyText>{savingThrowsLabel}</BodyText>
        </View>

        {damageTypeLabel ? (
          <View style={styles.block}>
            <BodyText style={styles.blockTitle}>Тип урона</BodyText>
            <BodyText>{damageTypeLabel}</BodyText>
          </View>
        ) : null}

        {/* Описание */}
        <View style={styles.block}>
          <BodyText style={styles.blockTitle}>Описание</BodyText>
          <BodyText>{spell.description}</BodyText>
        </View>

        {/* На высоких уровнях */}
        {spell.next_level_description ? (
          <View style={styles.block}>
            <BodyText style={styles.blockTitle}>На высоких уровнях</BodyText>
            <BodyText>{spell.next_level_description}</BodyText>
          </View>
        ) : null}

        <View style={styles.block}>
          <BodyText style={styles.blockTitle}>Классы</BodyText>
          {spell.class_ids.length === 0 ? (
            <BodyText style={styles.helperText}>Классы не указаны</BodyText>
          ) : (
            <View style={styles.chipsContainer}>
              {spell.class_ids.map((classId, index) => (
                <View key={classId} style={styles.chip}>
                  <BodyText style={styles.chipText}>{classNames[index]}</BodyText>
                </View>
              ))}
            </View>
          )}

          <BodyText style={styles.blockTitle}>Подклассы</BodyText>
          {isLoadingSubclasses ? (
            <BodyText style={styles.helperText}>Загружаю подклассы…</BodyText>
          ) : null}

          {hasSubclassError ? (
            <BodyText style={[styles.helperText, styles.errorText]}>
              Не удалось загрузить некоторые подклассы
            </BodyText>
          ) : null}

          {spell.subclass_ids.length === 0 ? (
            <BodyText style={styles.helperText}>Подклассы не указаны</BodyText>
          ) : (
            <View style={styles.chipsContainer}>
              {spell.subclass_ids.map((subclassId, index) => (
                <View key={subclassId} style={styles.chip}>
                  <BodyText style={styles.chipText}>{subclassNames[index]}</BodyText>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
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

  scrollContent: {
    paddingBottom: 24,
    rowGap: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  title: {
    flex: 1,
    marginBottom: 0,
  },
  spellNameEn: {
    color: colors.textSecondary,
  },
  spellMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  editButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.buttonPrimary,
  },
  editButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: "500",
  },
  deleteButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: "600",
  },

  block: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    rowGap: 4,
  },
  blockTitle: {
    fontWeight: "700",
    marginBottom: 4,
    color: colors.textPrimary,
  },
  labelText: {
    fontWeight: "600",
    color: colors.textSecondary,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  chipText: {
    color: colors.textPrimary,
  },
});
