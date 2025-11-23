import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function WeaponsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Оружие
      </Text>
      <Text>
        Здесь будет список оружия с данными из /api/v1/equipment/weapons.
      </Text>
    </ScrollView>
  );
}
