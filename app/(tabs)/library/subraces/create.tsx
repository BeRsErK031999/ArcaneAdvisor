import React from 'react';
import { useRouter } from 'expo-router';

import { SubraceForm } from '@/features/subraces/components/SubraceForm';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';

export default function CreateSubraceScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <SubraceForm
        mode="create"
        onSuccess={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/library/subraces');
          }
        }}
      />
    </ScreenContainer>
  );
}
