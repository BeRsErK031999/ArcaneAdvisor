import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { SubraceDetails } from '@/features/subraces/components/SubraceDetails';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BackButton } from '@/shared/ui/BackButton';
import { colors } from '@/shared/theme/colors';

export default function SubraceDetailsScreen() {
  const params = useLocalSearchParams<{ subraceId?: string }>();
  const subraceId = params.subraceId;

  if (!subraceId) {
    return (
      <ScreenContainer>
        <BackButton />
        <Text style={{ color: colors.error, marginTop: 16 }}>
          Не передан идентификатор подрасы.
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <BackButton />
      <SubraceDetails subraceId={subraceId} />
    </ScreenContainer>
  );
}
