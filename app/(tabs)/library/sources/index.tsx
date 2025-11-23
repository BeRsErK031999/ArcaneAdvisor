import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function SourcesScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Источники
      </Text>
      <Text>
        Здесь будут источники с данными из /api/v1/sources.
      </Text>
    </ScrollView>
  );
}
