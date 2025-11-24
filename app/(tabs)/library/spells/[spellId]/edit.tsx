import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { SpellForm } from '@/features/spells/components/SpellForm';
import { getSpellById } from '@/features/spells/api/getSpellById';
import type { SpellCreateInput } from '@/features/spells/api/types';

export default function SpellEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ spellId?: string | string[] }>();

  const spellIdParam = params.spellId;
  const spellId =
    typeof spellIdParam === 'string'
      ? spellIdParam
      : Array.isArray(spellIdParam)
      ? spellIdParam[0]
      : undefined;

  if (!spellId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>Не указан идентификатор заклинания.</Text>
      </View>
    );
  }

  const {
    data: spell,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['spells', spellId],
    queryFn: () => getSpellById(spellId),
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Загружаю заклинание...</Text>
      </View>
    );
  }

  if (isError || !spell) {
    console.error('Error loading spell for edit:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>Не удалось загрузить заклинание для редактирования.</Text>
        <Text onPress={() => refetch()} style={{ color: 'blue', marginTop: 8 }}>
          Повторить
        </Text>
      </View>
    );
  }

  const initialValues = spell as SpellCreateInput;

  return (
    <SpellForm
      mode="edit"
      spellId={spellId}
      initialValues={initialValues}
      onSuccess={() => {
        router.replace({
          pathname: '/(tabs)/library/spells/[spellId]',
          params: { spellId },
        });
      }}
      submitLabel="Сохранить изменения"
    />
  );
}
