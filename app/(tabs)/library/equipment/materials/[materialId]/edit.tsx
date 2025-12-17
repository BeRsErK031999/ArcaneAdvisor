import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { getMaterialById } from '@/features/materials/api/getMaterialById';
import type { MaterialCreateInput } from '@/features/materials/api/types';
import { MaterialForm } from '@/features/materials/components/MaterialForm';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText } from '@/shared/ui/Typography';
import { colors } from '@/shared/theme/colors';

export default function EditMaterialScreen() {
  const router = useRouter();
  const { materialId } = useLocalSearchParams<{ materialId: string }>();
  const resolvedId = String(materialId);

  const materialQuery = useQuery({
    queryKey: ['materials', resolvedId],
    queryFn: () => getMaterialById(resolvedId),
    enabled: Boolean(resolvedId),
  });

  if (materialQuery.isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю материал…</BodyText>
      </ScreenContainer>
    );
  }

  if (materialQuery.isError) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>Не удалось загрузить материал</BodyText>
        <BodyText style={styles.errorDetails}>{materialQuery.error?.message}</BodyText>

        <Pressable style={styles.retryButton} onPress={() => materialQuery.refetch()}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!materialQuery.data) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Материал не найден.</BodyText>
      </ScreenContainer>
    );
  }

  const initialValues: MaterialCreateInput = {
    name: materialQuery.data.name,
    description: materialQuery.data.description,
    rarity: materialQuery.data.rarity,
    source_id: materialQuery.data.source_id,
    weight: materialQuery.data.weight,
    cost: materialQuery.data.cost,
  };

  return (
    <MaterialForm
      mode="edit"
      materialId={resolvedId}
      initialValues={initialValues}
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={() => router.back()}
      submitLabel="Сохранить изменения"
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
