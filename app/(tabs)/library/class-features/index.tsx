import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function ClassFeaturesScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Фичи классов
      </Text>
      <Text>
        Здесь будет список фич классов с данными из /api/v1/class-features.
      </Text>
    </ScrollView>
  );
}
