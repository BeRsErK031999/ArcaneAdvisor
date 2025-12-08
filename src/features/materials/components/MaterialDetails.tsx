import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getMaterialById } from '@/features/materials/api/getMaterialById';
import type { Material } from '@/features/materials/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, SubtitleText, TitleText } from '@/shared/ui/Typography';

interface MaterialDetailsProps {
  materialId: string;
}

function formatWeight(weight: Material['weight']) {
  if (!weight) return '—';
  return `${weight.count} ${weight.unit}`;
}

function formatCost(cost: Material['cost']) {
  if (!cost) return '—';
  return `${cost.count} ${cost.piece_type}`;
}

export function MaterialDetails({ materialId }: MaterialDetailsProps) {
  const { data: material, isLoading, isError, error, refetch } = useQuery<Material, Error>({
    queryKey: ['materials', materialId],
    queryFn: () => getMaterialById(materialId),
  });

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю материал…</BodyText>
        </View>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>
            Не удалось загрузить материал
          </BodyText>
          <BodyText style={styles.errorDetails}>{error?.message}</BodyText>

          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (!material) {
    return null;
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TitleText>{material.name}</TitleText>

        <View style={styles.card}>
          <SubtitleText style={styles.sectionTitle}>Основная информация</SubtitleText>
          <BodyText style={styles.meta}>Редкость: {material.rarity}</BodyText>
          <BodyText style={styles.meta}>Вес: {formatWeight(material.weight)}</BodyText>
          <BodyText style={styles.meta}>Стоимость: {formatCost(material.cost)}</BodyText>
          <BodyText style={styles.meta}>Источник: {material.source_id}</BodyText>
        </View>

        {material.description ? (
          <View style={styles.card}>
            <SubtitleText style={styles.sectionTitle}>Описание</SubtitleText>
            <BodyText style={styles.description}>{material.description}</BodyText>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    marginTop: 32,
    alignItems: 'center',
    rowGap: 12,
  },
  helperText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
  },
  errorDetails: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
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
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 24,
    rowGap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    rowGap: 8,
  },
  sectionTitle: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
