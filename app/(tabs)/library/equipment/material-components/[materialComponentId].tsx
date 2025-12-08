import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import { MaterialComponentDetails } from '@/features/material-components/components/MaterialComponentDetails';

export default function MaterialComponentDetailsScreen() {
  const { materialComponentId } = useLocalSearchParams<{ materialComponentId: string }>();

  if (!materialComponentId) {
    return null;
  }

  return <MaterialComponentDetails materialComponentId={String(materialComponentId)} />;
}
