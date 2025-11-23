import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function SubracesScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Подрасы
      </Text>
      <Text>
        Здесь будет список подрас с данными из /api/v1/subraces.
      </Text>
    </ScrollView>
  );
}
