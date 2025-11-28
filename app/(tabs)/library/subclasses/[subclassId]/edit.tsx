import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { SubclassForm } from '@/features/subclasses/components/SubclassForm';
import { getSubclassById } from '@/features/subclasses/api/getSubclassById';
import type { SubclassCreateInput } from '@/features/subclasses/api/types';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { colors } from '@/shared/theme/colors';

export default function SubclassEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subclassId?: string | string[] }>();

  const subclassIdParam = params.subclassId;
  const subclassId =
    typeof subclassIdParam === 'string'
      ? subclassIdParam
      : Array.isArray(subclassIdParam)
      ? subclassIdParam[0]
      : undefined;

  if (!subclassId) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Не указан идентификатор подкласса.</Text>
      </ScreenContainer>
    );
  }

  const {
    data: subclass,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subclasses', subclassId],
    queryFn: () => getSubclassById(subclassId),
  });

  if (isLoading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Загружаю подкласс...</Text>
      </ScreenContainer>
    );
  }

  if (isError || !subclass) {
    console.error('Error loading subclass for edit:', error);
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>
          Не удалось загрузить подкласс для редактирования.
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

  const initialValues = subclass as SubclassCreateInput;

  return (
    <SubclassForm
      mode="edit"
      subclassId={subclassId}
      initialValues={initialValues}
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={() =>
        router.replace({
          pathname: '/(tabs)/library/subclasses',
        })
      }
      submitLabel="Сохранить изменения"
    />
  );
}
