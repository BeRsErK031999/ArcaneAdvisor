import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function DictionariesScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Справочники
      </Text>
      <Text>
        Здесь будут вспомогательные справочники с данными из /api/v1/dictionaries.
      </Text>
    </ScrollView>
  );
}
