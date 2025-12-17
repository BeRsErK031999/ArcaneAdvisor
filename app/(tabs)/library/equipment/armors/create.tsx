import React from 'react';
import { useRouter } from 'expo-router';

import { ArmorForm } from '@/features/armors/components/ArmorForm';

export default function ArmorCreateScreen() {
  const router = useRouter();

  return (
    <ArmorForm
      mode="create"
      onSuccess={(id) =>
        router.replace({
          pathname: '/(tabs)/library/equipment/armors/[armorId]',
          params: { armorId: id },
        })
      }
    />
  );
}
