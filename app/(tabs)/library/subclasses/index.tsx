import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function SubclassesScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Подклассы
      </Text>
      <Text>
        Здесь будет список подклассов с данными из /api/v1/subclasses.
      </Text>
    </ScrollView>
  );
}
