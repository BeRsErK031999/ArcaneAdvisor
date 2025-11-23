import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function CharactersScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Персонажи
      </Text>
      <Text style={{ marginTop: 8 }}>
        Здесь в будущем будет список персонажей и билдер.
      </Text>
    </ScrollView>
  );
}
