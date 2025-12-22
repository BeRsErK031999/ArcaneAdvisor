// src/features/spells/components/SpellsList.tsx
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { getSpells } from "@/features/spells/api/getSpells";
import type { Spell } from "@/features/spells/api/types";
import { colors } from "@/shared/theme/colors";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText, TitleText } from "@/shared/ui/Typography";

export function SpellsList() {
  const router = useRouter();

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<
    Spell[],
    Error
  >({
    queryKey: ["spells"],
    queryFn: getSpells,
  });

  const spells = data ?? [];

  const showList = !isLoading && !isError && spells.length > 0;
  const showEmpty = !isLoading && !isError && spells.length === 0;

  const handleCreate = () => {
    router.push("/(tabs)/library/spells/create");
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <TitleText>Заклинания</TitleText>

        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleCreate}
        >
          <BodyText style={styles.createButtonText}>+ Создать</BodyText>
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю заклинания…</BodyText>
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>
            Ошибка при загрузке заклинаний
          </BodyText>
          <BodyText style={styles.errorDetails}>
            {error?.message ?? "Неизвестная ошибка"}
          </BodyText>

          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => refetch()}
          >
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      )}

      {showEmpty && (
        <View style={styles.centered}>
          <BodyText style={styles.helperText}>Заклинаний пока нет</BodyText>

          <Pressable
            style={({ pressed }) => [
              styles.createButtonWide,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCreate}
          >
            <BodyText style={styles.createButtonText}>
              + Создать первое заклинание
            </BodyText>
          </Pressable>
        </View>
      )}

      {showList && (
        <FlatList
          data={spells}
          keyExtractor={(item) => item.spell_id}
          renderItem={({ item }) => <SpellListItem spell={item} />}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
    </ScreenContainer>
  );
}

type SpellListItemProps = {
  spell: Spell;
};

function SpellListItem({ spell }: SpellListItemProps) {
  const router = useRouter();

  const handleOpenDetails = () => {
    router.push({
      pathname: "/(tabs)/library/spells/[spellId]",
      params: { spellId: String(spell.spell_id) },
    });
  };

  return (
    <Pressable
      onPress={handleOpenDetails}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardHeader}>
        <BodyText style={styles.name}>{spell.name}</BodyText>
        <BodyText style={styles.level}>Уровень: {spell.level}</BodyText>
      </View>

      <BodyText style={styles.school}>Школа: {spell.school}</BodyText>

      {spell.description ? (
        <BodyText style={styles.description} numberOfLines={2}>
          {spell.description}
        </BodyText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  centered: {
    marginTop: 32,
    alignItems: "center",
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

  listContainer: {
    paddingBottom: 24,
    rowGap: 12,
  },

  separator: {
    height: 12,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },

  cardPressed: {
    backgroundColor: colors.surfaceElevated ?? colors.surface,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
    color: colors.textPrimary,
  },

  level: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  school: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },

  description: {
    fontSize: 13,
    color: colors.textMuted,
  },

  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
    alignItems: "center",
    justifyContent: "center",
  },

  createButtonWide: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
    alignItems: "center",
    justifyContent: "center",
  },

  createButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: "600",
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

  buttonPressed: {
    opacity: 0.85,
  },
});
