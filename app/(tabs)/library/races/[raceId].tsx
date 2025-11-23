import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import { RaceDetails } from '@/features/races/components/RaceDetails';

export default function RaceDetailsScreen() {
  const params = useLocalSearchParams<{ raceId?: string | string[] }>();

  const raceIdParam = params.raceId;
  const raceId =
    typeof raceIdParam === 'string'
      ? raceIdParam
      : Array.isArray(raceIdParam)
      ? raceIdParam[0]
      : undefined;

  if (!raceId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>Не указан идентификатор расы.</Text>
      </View>
    );
  }

  return <RaceDetails raceId={raceId} />;
}
