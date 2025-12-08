import React from 'react';
import { useRouter } from 'expo-router';

import { WeaponPropertyForm } from '@/features/weapon-properties/components/WeaponPropertyForm';

export default function CreateWeaponPropertyScreen() {
  const router = useRouter();

  return (
    <WeaponPropertyForm
      mode="create"
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={() => router.back()}
    />
  );
}
