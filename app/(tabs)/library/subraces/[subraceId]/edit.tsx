import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { getSubraceById } from '@/features/subraces/api/getSubraceById';
import type { SubraceCreateInput } from '@/features/subraces/api/types';
import { SubraceForm } from '@/features/subraces/components/SubraceForm';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { colors } from '@/shared/theme/colors';

export default function SubraceEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subraceId?: string | string[] }>();

  const subraceIdParam = params.subraceId;
  const subraceId =
    typeof subraceIdParam === 'string'
      ? subraceIdParam
      : Array.isArray(subraceIdParam)
      ? subraceIdParam[0]
      : undefined;

  if (!subraceId) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Не указан идентификатор подрасы.</Text>
      </ScreenContainer>
    );
  }

  const {
    data: subraceData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subraces', subraceId],
    queryFn: () => getSubraceById(subraceId),
  });

  if (isLoading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Загружаю подрасу...</Text>
      </ScreenContainer>
    );
  }

  if (isError || !subraceData) {
    console.error('Error loading subrace for edit:', error);
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>
          Не удалось загрузить подрасу для редактирования.
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

  const initialValues = subraceData as SubraceCreateInput;

  return (
    <SubraceForm
      mode="edit"
      subraceId={subraceId}
      initialValues={initialValues}
      onSuccess={() => {
        router.replace({
          pathname: '/(tabs)/library/subraces/[subraceId]',
          params: { subraceId },
        });
      }}
      submitLabel="Сохранить изменения"
    />
  );
}
