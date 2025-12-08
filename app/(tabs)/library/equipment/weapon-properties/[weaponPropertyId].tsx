import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import { WeaponPropertyDetails } from '@/features/weapon-properties/components/WeaponPropertyDetails';

export default function WeaponPropertyDetailsScreen() {
  const { weaponPropertyId } = useLocalSearchParams<{ weaponPropertyId: string }>();

  if (!weaponPropertyId) {
    return null;
  }

  return <WeaponPropertyDetails weaponPropertyId={String(weaponPropertyId)} />;
}
