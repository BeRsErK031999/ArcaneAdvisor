import React from 'react';
import { useRouter } from 'expo-router';
import { SpellForm } from '@/features/spells/components/SpellForm';

export default function SpellCreateScreen() {
  const router = useRouter();

  const handleSuccess = () => {
    // после успешного создания — назад к списку
    router.replace('/(tabs)/library/spells');
  };

  return <SpellForm onSuccess={handleSuccess} />;
}
