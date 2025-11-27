// src/features/spells/components/SpellDetails.tsx
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { getSpellById } from "@/features/spells/api/getSpellById";
import type { Spell } from "@/features/spells/api/types";
import { colors } from "@/shared/theme/colors";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText, TitleText } from "@/shared/ui/Typography";
import { BackButton } from "@/shared/ui/BackButton";

interface SpellDetailsProps {
  spellId: string;
}

export function SpellDetails({ spellId }: SpellDetailsProps) {
  const router = useRouter();
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
    if (spell.components.material) parts.push("M");
    const base = parts.join(", ");
    if (spell.components.material && spell.components.materials.length > 0) {
      return `${base} (${spell.components.materials.join(", ")})`;
    }
    return base || "—";
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

  const renderSavingThrows = () => {
    if (!spell.saving_throws || spell.saving_throws.length === 0) {
      return "—";
    }
    return spell.saving_throws.join(", ");
  };

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

        {/* Кнопка "Редактировать" */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(tabs)/library/spells/[spellId]/edit",
              params: { spellId: spell.spell_id },
            })
          }
          style={styles.editButton}
        >
          <BodyText style={styles.editButtonText}>Редактировать</BodyText>
        </Pressable>

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

        {/* Сейвы */}
        <View style={styles.block}>
          <BodyText style={styles.blockTitle}>Сейвы</BodyText>
          <BodyText>{renderSavingThrows()}</BodyText>
        </View>

        {/* Тип урона */}
        {spell.damage_type?.name ? (
          <View style={styles.block}>
            <BodyText style={styles.blockTitle}>Тип урона</BodyText>
            <BodyText>{spell.damage_type.name}</BodyText>
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

        {/* Привязка к классам/подклассам */}
        <View style={styles.block}>
          <BodyText style={styles.blockTitle}>Классы</BodyText>
          <BodyText>
            Привязано к {spell.class_ids.length} классам
          </BodyText>
          <BodyText>
            Привязано к {spell.subclass_ids.length} подклассам
          </BodyText>
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
});
