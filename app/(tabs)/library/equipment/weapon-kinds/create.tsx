import React from 'react';
import { useRouter } from 'expo-router';

import { WeaponKindForm } from '@/features/weapon-kinds/components/WeaponKindForm';

export default function CreateWeaponKindScreen() {
  const router = useRouter();

  return (
    <WeaponKindForm
      mode="create"
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={() => router.back()}
    />
  );
}
