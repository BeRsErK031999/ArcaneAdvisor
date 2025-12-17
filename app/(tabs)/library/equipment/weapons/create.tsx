import React from 'react';
import { useRouter } from 'expo-router';

import { WeaponForm } from '@/features/weapons/components/WeaponForm';

export default function WeaponCreateScreen() {
  const router = useRouter();

  return (
    <WeaponForm
      mode="create"
      showBackButton
      onSuccess={(createdId) =>
        router.replace({
          pathname: '/(tabs)/library/equipment/weapons/[weaponId]',
          params: { weaponId: createdId },
        })
      }
    />
  );
}
