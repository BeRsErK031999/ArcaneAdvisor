import React from 'react';
import { useRouter } from 'expo-router';
import { RaceForm } from '@/features/races/components/RaceForm';

export default function RaceCreateScreen() {
  const router = useRouter();

  const handleSuccess = () => {
    router.replace('/(tabs)/library/races');
  };

  return <RaceForm onSuccess={handleSuccess} />;
}
