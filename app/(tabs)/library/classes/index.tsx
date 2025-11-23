import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function ClassesScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Классы
      </Text>
      <Text>
        Здесь будет список классов с данными из /api/v1/classes.
      </Text>
    </ScrollView>
  );
}
