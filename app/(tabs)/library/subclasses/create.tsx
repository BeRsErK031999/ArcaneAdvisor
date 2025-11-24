import React from 'react';
import { useRouter } from 'expo-router';

import { SubclassForm } from '@/features/subclasses/components/SubclassForm';

export default function SubclassCreateScreen() {
  const router = useRouter();
  return <SubclassForm onSuccess={() => router.replace('/(tabs)/library/subclasses')} />;
}
