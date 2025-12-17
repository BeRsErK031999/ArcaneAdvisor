import React from 'react';
import { useRouter } from 'expo-router';

import { MaterialForm } from '@/features/materials/components/MaterialForm';

export default function CreateMaterialScreen() {
  const router = useRouter();

  return (
    <MaterialForm
      mode="create"
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={(id) =>
        router.replace({
          pathname: '/(tabs)/library/equipment/materials/[materialId]',
          params: { materialId: String(id) },
        })
      }
    />
  );
}
