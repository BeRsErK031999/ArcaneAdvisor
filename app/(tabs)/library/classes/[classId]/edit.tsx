import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ClassForm } from '@/features/classes/components/ClassForm';
import { getClassById } from '@/features/classes/api/getClassById';
import type { ClassCreateInput } from '@/features/classes/api/types';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { colors } from '@/shared/theme/colors';

export default function ClassEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ classId?: string | string[] }>();

  const classIdParam = params.classId;
  const classId =
    typeof classIdParam === 'string'
      ? classIdParam
      : Array.isArray(classIdParam)
      ? classIdParam[0]
      : undefined;

  if (!classId) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Не указан идентификатор класса.</Text>
      </ScreenContainer>
    );
  }

  const {
    data: classData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['classes', classId],
    queryFn: () => getClassById(classId),
  });

  if (isLoading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Загружаю класс...</Text>
      </ScreenContainer>
    );
  }

  if (isError || !classData) {
    console.error('Error loading class for edit:', error);
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>
          Не удалось загрузить класс для редактирования.
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

  const initialValues = classData as ClassCreateInput;

  return (
    <ClassForm
      mode="edit"
      classId={classId}
      initialValues={initialValues}
      onSuccess={() => {
        router.replace({
          pathname: '/(tabs)/library/classes/[classId]',
          params: { classId },
        });
      }}
      submitLabel="Сохранить изменения"
    />
  );
}
