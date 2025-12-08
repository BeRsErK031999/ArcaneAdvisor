import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import { MaterialDetails } from '@/features/materials/components/MaterialDetails';

export default function MaterialDetailsScreen() {
  const { materialId } = useLocalSearchParams<{ materialId: string }>();

  if (!materialId) {
    return null;
  }

  return <MaterialDetails materialId={String(materialId)} />;
}
