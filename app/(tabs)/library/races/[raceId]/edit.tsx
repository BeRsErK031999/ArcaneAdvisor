import React from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { getRaceById } from '@/features/races/api/getRaceById';
import type { Race, RaceCreateInput } from '@/features/races/api/types';
import { RaceForm } from '@/features/races/components/RaceForm';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BackButton } from '@/shared/ui/BackButton';
import { colors } from '@/shared/theme/colors';

export default function EditRaceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ raceId?: string }>();
  const raceId = params.raceId;

  if (!raceId) {
    return (
      <ScreenContainer>
        <BackButton />
        <Text style={{ color: colors.error, marginTop: 16 }}>
          Не передан идентификатор расы.
        </Text>
      </ScreenContainer>
    );
  }

  const {
    data: race,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Race>({
    queryKey: ['races', raceId],
    queryFn: () => getRaceById(raceId),
  });

  if (isLoading) {
    return (
      <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', rowGap: 8 }}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary }}>Загружаю расу...</Text>
      </ScreenContainer>
    );
  }

  if (isError) {
    console.error('Error loading race for edit:', error);
    return (
      <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', rowGap: 8 }}>
        <BackButton />
        <Text style={{ color: colors.error, textAlign: 'center' }}>
          Ошибка при загрузке расы.
        </Text>
        <Text
          onPress={() => refetch()}
          style={{ color: colors.buttonPrimary, textDecorationLine: 'underline' }}
        >
          Повторить запрос
        </Text>
      </ScreenContainer>
    );
  }

  if (!race) {
    return (
      <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <BackButton />
        <Text style={{ color: colors.textSecondary }}>Раса не найдена.</Text>
      </ScreenContainer>
    );
  }

  const { race_id, ...rest } = race;
  const initialValues: RaceCreateInput = rest;

  return (
    <ScreenContainer>
      <RaceForm
        mode="edit"
        raceId={raceId}
        initialValues={initialValues}
        onSuccess={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/library/races');
          }
        }}
      />
    </ScreenContainer>
  );
}
