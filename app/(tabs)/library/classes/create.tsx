import React from 'react';
import { useRouter } from 'expo-router';
import { ClassForm } from '@/features/classes/components/ClassForm';

export default function ClassCreateScreen() {
  const router = useRouter();

  const handleSuccess = () => {
    router.replace('/(tabs)/library/classes');
  };

  return <ClassForm onSuccess={handleSuccess} />;
}
