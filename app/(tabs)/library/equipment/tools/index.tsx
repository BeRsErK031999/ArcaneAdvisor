import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function ToolsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Инструменты
      </Text>
      <Text>
        Здесь будет список инструментов с данными из /api/v1/equipment/tools.
      </Text>
    </ScrollView>
  );
}
