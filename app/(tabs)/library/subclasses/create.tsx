import React from 'react';
import { useRouter } from 'expo-router';

import { SubclassForm } from '@/features/subclasses/components/SubclassForm';

export default function SubclassCreateScreen() {
  const router = useRouter();
  return (
    <SubclassForm
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={() => router.replace('/(tabs)/library/subclasses')}
    />
  );
}
