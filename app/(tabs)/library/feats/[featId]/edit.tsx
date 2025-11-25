import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { FeatForm } from '@/features/feats/components/FeatForm';
import { getFeatById } from '@/features/feats/api/getFeatById';
import type { FeatCreateInput } from '@/features/feats/api/types';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { colors } from '@/shared/theme/colors';

export default function FeatEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ featId?: string | string[] }>();

  const featIdParam = params.featId;
  const featId =
    typeof featIdParam === 'string'
      ? featIdParam
      : Array.isArray(featIdParam)
      ? featIdParam[0]
      : undefined;

  if (!featId) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Не указан идентификатор способности.</Text>
      </ScreenContainer>
    );
  }

  const {
    data: feat,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['feats', featId],
    queryFn: () => getFeatById(featId),
  });

  if (isLoading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Загружаю способность...</Text>
      </ScreenContainer>
    );
  }

  if (isError || !feat) {
    console.error('Error loading feat for edit:', error);
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>
          Не удалось загрузить способность для редактирования.
        </Text>
        <Text
          onPress={() => refetch()}
          style={{ color: colors.buttonPrimary, textDecorationLine: 'underline' }}
        >
          Повторить
        </Text>
      </ScreenContainer>
    );
  }

  const initialValues = feat as FeatCreateInput;

  return (
    <FeatForm
      mode="edit"
      featId={featId}
      initialValues={initialValues}
      onSuccess={() =>
        router.replace({
          pathname: '/(tabs)/library/feats',
        })
      }
      submitLabel="Сохранить изменения"
    />
  );
}
