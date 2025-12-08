import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import { ToolDetails } from '@/features/tools/components/ToolDetails';

export default function ToolDetailsScreen() {
  const { toolId } = useLocalSearchParams();
  return <ToolDetails toolId={String(toolId)} />;
}
