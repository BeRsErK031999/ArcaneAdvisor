import React from 'react';
import { useRouter } from 'expo-router';

import { FeatForm } from '@/features/feats/components/FeatForm';

export default function FeatCreateScreen() {
  const router = useRouter();
  return (
    <FeatForm
      mode="create"
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={(createdId) =>
        router.replace({
          pathname: '/(tabs)/library/feats/[featId]',
          params: { featId: createdId },
        })
      }
    />
  );
}
