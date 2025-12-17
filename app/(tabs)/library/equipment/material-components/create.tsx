import React from 'react';
import { useRouter } from 'expo-router';

import { MaterialComponentForm } from '@/features/material-components/components/MaterialComponentForm';

export default function CreateMaterialComponentScreen() {
  const router = useRouter();

  return (
    <MaterialComponentForm
      mode="create"
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={(id) =>
        router.replace({
          pathname: '/(tabs)/library/equipment/material-components/[materialComponentId]',
          params: { materialComponentId: String(id) },
        })
      }
    />
  );
}
