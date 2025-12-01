import React from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { getSubraceById } from '@/features/subraces/api/getSubraceById';
import type { Subrace, SubraceCreateInput } from '@/features/subraces/api/types';
import { SubraceForm } from '@/features/subraces/components/SubraceForm';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BackButton } from '@/shared/ui/BackButton';
import { colors } from '@/shared/theme/colors';

export default function SubraceEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subraceId?: string }>();
  const subraceId = params.subraceId;

  if (!subraceId) {
    return (
      <ScreenContainer>
        <BackButton />
        <Text style={{ color: colors.error, marginTop: 16 }}>
          Не передан идентификатор подрасы.
        </Text>
      </ScreenContainer>
    );
  }

  const {
    data: subrace,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Subrace>({
    queryKey: ['subraces', subraceId],
    queryFn: () => getSubraceById(subraceId),
  });

  if (isLoading) {
    return (
      <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', rowGap: 8 }}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary }}>Загружаю подрасу...</Text>
      </ScreenContainer>
    );
  }

  if (isError) {
    console.error('Error loading subrace for edit:', error);
    return (
      <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', rowGap: 8 }}>
        <BackButton />
        <Text style={{ color: colors.error, textAlign: 'center' }}>
          Ошибка при загрузке подрасы.
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

  if (!subrace) {
    return (
      <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <BackButton />
        <Text style={{ color: colors.textSecondary }}>Подраса не найдена.</Text>
      </ScreenContainer>
    );
  }

  const { subrace_id, ...rest } = subrace;
  const initialValues: SubraceCreateInput = rest;

  return (
    <ScreenContainer>
      <SubraceForm
        mode="edit"
        subraceId={subraceId}
        initialValues={initialValues}
        onSuccess={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/library/subraces');
          }
        }}
      />
    </ScreenContainer>
  );
}
