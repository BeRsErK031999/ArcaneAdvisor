import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import { WeaponDetails } from '@/features/weapons/components/WeaponDetails';

export default function WeaponDetailsScreen() {
  const { weaponId } = useLocalSearchParams();
  return <WeaponDetails weaponId={String(weaponId)} />;
}
