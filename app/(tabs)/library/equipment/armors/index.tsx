import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function ArmorsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Доспехи
      </Text>
      <Text>
        Здесь будет список доспехов с данными из /api/v1/equipment/armors.
      </Text>
    </ScrollView>
  );
}
