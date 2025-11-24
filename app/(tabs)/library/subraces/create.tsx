import React from 'react';
import { useRouter } from 'expo-router';

import { SubraceForm } from '@/features/subraces/components/SubraceForm';

export default function SubraceCreateScreen() {
  const router = useRouter();
  return <SubraceForm onSuccess={() => router.replace('/(tabs)/library/subraces')} />;
}
