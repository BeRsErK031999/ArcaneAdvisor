import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import { ArmorDetails } from '@/features/armors/components/ArmorDetails';

export default function ArmorDetailsScreen() {
  const { armorId } = useLocalSearchParams();
  return <ArmorDetails armorId={String(armorId)} />;
}
