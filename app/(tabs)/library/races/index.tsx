import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function RacesScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Расы
      </Text>
      <Text>
        Здесь будет список рас с данными из /api/v1/races.
      </Text>
    </ScrollView>
  );
}
