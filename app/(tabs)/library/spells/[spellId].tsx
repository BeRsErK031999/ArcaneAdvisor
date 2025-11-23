import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { SpellDetails } from '@/features/spells/components/SpellDetails';

export default function SpellDetailsScreen() {
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

  return <SpellDetails spellId={spellId} />;
}
