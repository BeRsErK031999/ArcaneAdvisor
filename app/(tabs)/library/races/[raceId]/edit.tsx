import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { RaceForm } from '@/features/races/components/RaceForm';
import { getRaceById } from '@/features/races/api/getRaceById';
import type { RaceCreateInput } from '@/features/races/api/types';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { colors } from '@/shared/theme/colors';

export default function RaceEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ raceId?: string | string[] }>();

  const raceIdParam = params.raceId;
  const raceId =
    typeof raceIdParam === 'string'
      ? raceIdParam
      : Array.isArray(raceIdParam)
      ? raceIdParam[0]
      : undefined;

  if (!raceId) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Не указан идентификатор расы.</Text>
      </ScreenContainer>
    );
  }

  const {
    data: raceData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['races', raceId],
    queryFn: () => getRaceById(raceId),
  });

  if (isLoading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Загружаю расу...</Text>
      </ScreenContainer>
    );
  }

  if (isError || !raceData) {
    console.error('Error loading race for edit:', error);
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>
          Не удалось загрузить расу для редактирования.
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

  const initialValues = raceData as RaceCreateInput;

  return (
    <RaceForm
      mode="edit"
      raceId={raceId}
      initialValues={initialValues}
      onSuccess={() => {
        router.replace({
          pathname: '/(tabs)/library/races/[raceId]',
          params: { raceId },
        });
      }}
      submitLabel="Сохранить изменения"
    />
  );
}
