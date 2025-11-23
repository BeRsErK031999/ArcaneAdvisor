import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function ClassLevelsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Уровни классов
      </Text>
      <Text>
        Здесь будет список уровней классов с данными из /api/v1/class-levels.
      </Text>
    </ScrollView>
  );
}
