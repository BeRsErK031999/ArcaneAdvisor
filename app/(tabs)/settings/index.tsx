import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Настройки
      </Text>
      <Text style={{ marginTop: 8 }}>
        Здесь в будущем будут настройки профиля и приложения.
      </Text>
    </ScrollView>
  );
}
