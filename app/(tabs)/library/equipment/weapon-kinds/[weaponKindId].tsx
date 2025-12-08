import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import { WeaponKindDetails } from '@/features/weapon-kinds/components/WeaponKindDetails';

export default function WeaponKindDetailsScreen() {
  const { weaponKindId } = useLocalSearchParams<{ weaponKindId: string }>();

  if (!weaponKindId) {
    return null;
  }

  return <WeaponKindDetails weaponKindId={String(weaponKindId)} />;
}
