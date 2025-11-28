import React from 'react';
import { useRouter } from 'expo-router';

import { RaceForm } from '@/features/races/components/RaceForm';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';

export default function CreateRaceScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <RaceForm
        mode="create"
        onSuccess={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/library/races');
          }
        }}
      />
    </ScreenContainer>
  );
}
