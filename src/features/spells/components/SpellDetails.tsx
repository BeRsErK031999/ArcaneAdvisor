import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { getSpellById } from '@/features/spells/api/getSpellById';

interface SpellDetailsProps {
  spellId: string;
}

export function SpellDetails({ spellId }: SpellDetailsProps) {
  const router = useRouter();
  const { data: spell, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['spells', spellId],
    queryFn: () => getSpellById(spellId),
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Загружаю заклинание…</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Failed to load spell:', error);
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>Ошибка при загрузке заклинания</Text>
        <Text style={{ color: '#2563eb' }} onPress={() => refetch()}>
          Повторить
        </Text>
      </View>
    );
  }

  if (!spell) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text>Заклинание не найдено.</Text>
      </View>
    );
  }

  const renderComponents = () => {
    const parts: string[] = [];
    if (spell.components.verbal) parts.push('V');
    if (spell.components.symbolic) parts.push('S');
    if (spell.components.material) parts.push('M');
    const base = parts.join(', ');
    if (spell.components.material && spell.components.materials.length > 0) {
      return `${base} (${spell.components.materials.join(', ')})`;
    }
    return base || '—';
  };

  const renderDuration = () => {
    if (!spell.duration || !spell.duration.game_time) {
      return 'Мгновенно';
    }
    const { count, unit } = spell.duration.game_time;
    return `${count} ${unit}`;
  };

  const renderSplash = () => {
    if (!spell.splash || !spell.splash.splash) {
      return null;
    }
    const { count, unit } = spell.splash.splash;
    return `${count} ${unit}`;
  };

  const renderSavingThrows = () => {
    if (!spell.saving_throws || spell.saving_throws.length === 0) {
      return '—';
    }
    return spell.saving_throws.join(', ');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>{spell.name}</Text>
        <Text style={{ color: '#6b7280' }}>{spell.name_in_english}</Text>
        <Text style={{ color: '#374151' }}>
          Уровень {spell.level}, школа: {spell.school}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(tabs)/library/spells/[spellId]/edit',
            params: { spellId: spell.spell_id },
          })
        }
        style={{
          marginTop: 12,
          marginBottom: 4,
          alignSelf: 'flex-start',
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 6,
          backgroundColor: '#007bff',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '500' }}>Редактировать</Text>
      </TouchableOpacity>

      <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, gap: 6 }}>
        <Text>
          Время каста: {spell.casting_time.count} {spell.casting_time.unit}
        </Text>
        <Text>
          Дистанция: {spell.spell_range.count} {spell.spell_range.unit}
        </Text>
        <Text>Длительность: {renderDuration()}</Text>
        {renderSplash() ? <Text>Область: {renderSplash()}</Text> : null}
        <Text>Концентрация: {spell.concentration ? 'да' : 'нет'}</Text>
        <Text>Ритуал: {spell.ritual ? 'да' : 'нет'}</Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={{ fontWeight: '600' }}>Компоненты</Text>
        <Text>{renderComponents()}</Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={{ fontWeight: '600' }}>Сейвы</Text>
        <Text>{renderSavingThrows()}</Text>
      </View>

      {spell.damage_type?.name ? (
        <View style={{ gap: 4 }}>
          <Text style={{ fontWeight: '600' }}>Тип урона</Text>
          <Text>{spell.damage_type.name}</Text>
        </View>
      ) : null}

      <View style={{ gap: 4 }}>
        <Text style={{ fontWeight: '600' }}>Описание</Text>
        <Text>{spell.description}</Text>
      </View>

      {spell.next_level_description ? (
        <View style={{ gap: 4 }}>
          <Text style={{ fontWeight: '600' }}>На высоких уровнях</Text>
          <Text>{spell.next_level_description}</Text>
        </View>
      ) : null}

      <View style={{ gap: 4 }}>
        <Text style={{ fontWeight: '600' }}>Классы</Text>
        <Text>Привязано к {spell.class_ids.length} классам</Text>
        <Text>Привязано к {spell.subclass_ids.length} подклассам</Text>
      </View>
    </ScrollView>
  );
}
