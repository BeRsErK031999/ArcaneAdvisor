import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { deleteMaterial } from '@/features/materials/api/deleteMaterial';
import { getMaterialById } from '@/features/materials/api/getMaterialById';
import type { Material } from '@/features/materials/api/types';
import { getSources } from '@/features/sources/api/getSources';
import type { Source } from '@/features/sources/api/types';
import { colors } from '@/shared/theme/colors';
import { BackButton } from '@/shared/ui/BackButton';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, SubtitleText, TitleText } from '@/shared/ui/Typography';

interface MaterialDetailsProps {
  materialId: string;
}

const coinLabels: Record<string, string> = {
  cp: 'мед',
  sp: 'сер',
  gp: 'зол',
  pp: 'плат',
};

function formatWeight(weight: Material['weight']) {
  if (!weight || !weight.count || !weight.unit) return '—';
  return `${weight.count} ${weight.unit}`;
}

function formatCost(cost: Material['cost']) {
  if (!cost || !cost.count || !cost.piece_type) return '—';
  const label = coinLabels[cost.piece_type] ?? cost.piece_type;
  return `${cost.count} ${label}`;
}

export function MaterialDetails({ materialId }: MaterialDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: material, isLoading, isError, error, refetch } = useQuery<Material, Error>({
    queryKey: ['materials', materialId],
    queryFn: () => getMaterialById(materialId),
  });

  const { data: sources, isError: isSourcesError } = useQuery<Source[], Error>({
    queryKey: ['sources'],
    queryFn: getSources,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMaterial(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.removeQueries({ queryKey: ['materials', materialId] });
      router.back();
    },
  });

  const source = sources?.find((item) => item.source_id === material?.source_id);

  const handleEdit = () => {
    router.push({
      pathname: '/(tabs)/library/equipment/materials/[materialId]/edit',
      params: { materialId },
    });
  };

  const handleDelete = () => {
    Alert.alert('Удалить материал', 'Вы уверены, что хотите удалить материал?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

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
        <View style={styles.headerRow}>
          <BackButton />
          <TitleText style={styles.title}>{material.name}</TitleText>
        </View>

        <View style={styles.card}>
          <SubtitleText style={styles.sectionTitle}>Основная информация</SubtitleText>
          <BodyText style={styles.meta}>Редкость: {material.rarity}</BodyText>
          <BodyText style={styles.meta}>Вес: {formatWeight(material.weight)}</BodyText>
          <BodyText style={styles.meta}>Стоимость: {formatCost(material.cost)}</BodyText>
          <BodyText style={styles.meta}>
            Источник:{' '}
            {source
              ? `${source.name}${source.name_in_english ? ` (${source.name_in_english})` : ''}`
              : isSourcesError
              ? '—'
              : '—'}
          </BodyText>
        </View>

        {material.description ? (
          <View style={styles.card}>
            <SubtitleText style={styles.sectionTitle}>Описание</SubtitleText>
            <BodyText style={styles.description}>{material.description}</BodyText>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable style={styles.secondaryButton} onPress={handleEdit}>
            <BodyText style={styles.secondaryButtonText}>Редактировать</BodyText>
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <BodyText style={styles.deleteButtonText}>Удалить</BodyText>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  title: {
    flex: 1,
  },
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
  actionsRow: {
    flexDirection: 'row',
    columnGap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
});
