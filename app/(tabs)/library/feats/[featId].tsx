import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { FeatDetails } from '@/features/feats/components/FeatDetails';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { colors } from '@/shared/theme/colors';

export default function FeatDetailsScreen() {
  const params = useLocalSearchParams<{ featId?: string | string[] }>();
  const featIdParam = params.featId;
  const featId =
    typeof featIdParam === 'string'
      ? featIdParam
      : Array.isArray(featIdParam)
      ? featIdParam[0]
      : undefined;

  if (!featId) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Не указан идентификатор способности.</Text>
      </ScreenContainer>
    );
  }

  return <FeatDetails featId={featId} />;
}
