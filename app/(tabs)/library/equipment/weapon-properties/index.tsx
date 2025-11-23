import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function WeaponPropertiesScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Свойства оружия
      </Text>
      <Text>
        Здесь будут свойства оружия с данными из /api/v1/equipment/weapon-properties.
      </Text>
    </ScrollView>
  );
}
