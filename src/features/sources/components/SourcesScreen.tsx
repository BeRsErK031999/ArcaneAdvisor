import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { getSources } from "@/features/sources/api/getSources";
import type { Source } from "@/features/sources/api/types";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText } from "@/shared/ui/Typography";
import { colors } from "@/shared/theme/colors";

export const SourcesScreen: React.FC = () => {
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
          Ошибка при загрузке источников
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

  if (!sources || sources.length === 0) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={styles.helperText}>Источников пока нет</BodyText>

        <Link href="/(tabs)/library/sources/create" asChild>
          <Pressable style={styles.createButton}>
            <BodyText style={styles.createButtonText}>
              Создать первый источник
            </BodyText>
          </Pressable>
        </Link>
      </ScreenContainer>
    );
  }

  const renderItem = ({ item }: { item: Source }) => (
    <View style={styles.card}>
      <BodyText style={styles.cardTitle}>{item.name}</BodyText>
      <BodyText style={styles.cardSubtitle}>{item.name_in_english}</BodyText>
      <BodyText style={styles.cardDescription}>{item.description}</BodyText>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <BodyText style={styles.title}>Источники</BodyText>

        <Link href="/(tabs)/library/sources/create" asChild>
          <Pressable style={styles.createButton}>
            <BodyText style={styles.createButtonText}>+ Создать</BodyText>
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={sources}
        keyExtractor={(item) => item.source_id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
};

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
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
  },
  createButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: 8,
    rowGap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderMuted,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardSubtitle: {
    marginTop: 4,
    color: colors.textMuted,
  },
  cardDescription: {
    marginTop: 8,
    color: colors.textPrimary,
  },
});
