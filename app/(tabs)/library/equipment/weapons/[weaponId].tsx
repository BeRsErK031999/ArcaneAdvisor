import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText } from '@/shared/ui/Typography';

import { WeaponDetails } from '@/features/weapons/components/WeaponDetails';

export default function WeaponDetailsScreen() {
  const { weaponId } = useLocalSearchParams();
  if (!weaponId) {
    return (
      <ScreenContainer>
        <BodyText>Не указан идентификатор оружия.</BodyText>
      </ScreenContainer>
    );
  }

  return <WeaponDetails weaponId={String(weaponId)} />;
}
