import React from 'react';
import { Link, type Href } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type Section = {
  label: string;
  href: Href;
  group?: string;
  description?: string;
};

const sections: Section[] = [
  { label: 'Заклинания', href: '/(tabs)/library/spells' },
  { label: 'Классы', href: '/(tabs)/library/classes' },
  { label: 'Подклассы', href: '/(tabs)/library/subclasses' },
  { label: 'Фичи классов', href: '/(tabs)/library/class-features' },
  { label: 'Уровни классов', href: '/(tabs)/library/class-levels' },
  { label: 'Расы', href: '/(tabs)/library/races' },
  { label: 'Подрасы', href: '/(tabs)/library/subraces' },
  { label: 'Способности (feats)', href: '/(tabs)/library/feats' },
  { label: 'Доспехи', href: '/(tabs)/library/equipment/armors', group: 'Снаряжение' },
  { label: 'Оружие', href: '/(tabs)/library/equipment/weapons', group: 'Снаряжение' },
  { label: 'Инструменты', href: '/(tabs)/library/equipment/tools', group: 'Снаряжение' },
  { label: 'Материалы', href: '/(tabs)/library/equipment/materials', group: 'Снаряжение' },
  { label: 'Материальные компоненты', href: '/(tabs)/library/equipment/material-components', group: 'Снаряжение' },
  { label: 'Типы оружия', href: '/(tabs)/library/equipment/weapon-kinds', group: 'Снаряжение' },
  { label: 'Свойства оружия', href: '/(tabs)/library/equipment/weapon-properties', group: 'Снаряжение' },
  { label: 'Источники', href: '/(tabs)/library/sources' },
  {
    label: 'Справочники',
    href: '/(tabs)/library/dictionaries',
    description: 'служебные типы: кости, монеты, типы урона, модификаторы, навыки, типы существ, размеры, единицы длины/веса/времени',
  },
];

export default function LibraryMenuScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>
        Справочник ArcaneAdvisor
      </Text>
      {sections.map((section) => (
        <View key={section.label} style={{ gap: 4 }}>
          {section.group ? (
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{section.group}</Text>
          ) : null}
          <Link href={section.href} asChild>
            <TouchableOpacity
              style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
              <Text style={{ fontSize: 18 }}>{section.label}</Text>
              {section.description ? (
                <Text style={{ marginTop: 4, color: '#555' }}>{section.description}</Text>
              ) : null}
            </TouchableOpacity>
          </Link>
        </View>
      ))}
    </ScrollView>
  );
}
