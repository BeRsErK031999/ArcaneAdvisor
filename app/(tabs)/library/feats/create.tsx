import React from 'react';
import { useRouter } from 'expo-router';

import { FeatForm } from '@/features/feats/components/FeatForm';

export default function FeatCreateScreen() {
  const router = useRouter();
  return <FeatForm onSuccess={() => router.replace('/(tabs)/library/feats')} />;
}
