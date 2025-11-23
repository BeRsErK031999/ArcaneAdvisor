import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function MaterialComponentsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Материальные компоненты
      </Text>
      <Text>
        Здесь будут материальные компоненты с данными из /api/v1/equipment/material-components.
      </Text>
    </ScrollView>
  );
}
