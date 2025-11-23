import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function FeatsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Способности (feats)
      </Text>
      <Text>
        Здесь будут способности с данными из /api/v1/feats.
      </Text>
    </ScrollView>
  );
}
