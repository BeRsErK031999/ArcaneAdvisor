import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import { SubclassDetails } from '@/features/subclasses/components/SubclassDetails';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText } from '@/shared/ui/Typography';

export default function SubclassDetailsScreen() {
  const params = useLocalSearchParams<{ subclassId?: string | string[] }>();

  const subclassIdParam = params.subclassId;
  const subclassId =
    typeof subclassIdParam === 'string'
      ? subclassIdParam
      : Array.isArray(subclassIdParam)
      ? subclassIdParam[0]
      : undefined;

  if (!subclassId) {
    return (
      <ScreenContainer style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <BodyText>Не указан идентификатор подкласса.</BodyText>
      </ScreenContainer>
    );
  }

  return <SubclassDetails subclassId={subclassId} />;
}
