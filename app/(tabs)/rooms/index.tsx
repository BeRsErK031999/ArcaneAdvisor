import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function RoomsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Комнаты
      </Text>
      <Text style={{ marginTop: 8 }}>
        Здесь в будущем будет лента комнат и сообщений.
      </Text>
    </ScrollView>
  );
}
