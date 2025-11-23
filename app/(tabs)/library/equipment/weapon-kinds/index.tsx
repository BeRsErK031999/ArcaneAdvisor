import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function WeaponKindsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Типы оружия
      </Text>
      <Text>
        Здесь будут типы оружия с данными из /api/v1/equipment/weapon-kinds.
      </Text>
    </ScrollView>
  );
}
