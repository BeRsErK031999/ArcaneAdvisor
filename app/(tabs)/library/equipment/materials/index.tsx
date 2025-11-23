import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function MaterialsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Материалы
      </Text>
      <Text>
        Здесь будут материалы с данными из /api/v1/equipment/materials.
      </Text>
    </ScrollView>
  );
}
