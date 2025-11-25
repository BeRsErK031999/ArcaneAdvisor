import React from 'react';
import { ActivityIndicator, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getRaceById } from '@/features/races/api/getRaceById';
import type { Race } from '@/features/races/api/types';
import { colors } from '@/shared/theme/colors';

interface RaceDetailsProps {
  raceId: string;
}

export const RaceDetails: React.FC<RaceDetailsProps> = ({ raceId }) => {
  const router = useRouter();
  const {
    data: race,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Race>({
    queryKey: ['races', raceId],
    queryFn: () => getRaceById(raceId),
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Загружаю расу...</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Error loading race:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>Ошибка при загрузке расы.</Text>
        <Text
          onPress={() => refetch()}
          style={{ color: 'blue', textDecorationLine: 'underline' }}
        >
          Повторить запрос
        </Text>
      </View>
    );
  }

  if (!race) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>Раса не найдена.</Text>
      </View>
    );
  }

  const modifiersText = race.increase_modifiers
    .map((m) => `${m.modifier} +${m.bonus}`)
    .join(', ');

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{race.name}</Text>
        <Text style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
          {race.name_in_english}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(tabs)/library/races/[raceId]/edit',
            params: { raceId: race.race_id },
          })
        }
        style={{
          marginTop: 12,
          marginBottom: 8,
          alignSelf: 'flex-start',
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 9999,
          backgroundColor: colors.buttonPrimary,
        }}
      >
        <Text style={{ color: colors.buttonPrimaryText, fontWeight: '500' }}>Редактировать</Text>
      </TouchableOpacity>

      <View>
        <Text style={{ fontWeight: '600' }}>Тип и размер:</Text>
        <Text>
          {race.creature_type}, {race.creature_size}
        </Text>
      </View>

      <View>
        <Text style={{ fontWeight: '600' }}>Скорость:</Text>
        <Text>
          {race.speed.base_speed.count} {race.speed.base_speed.unit}
        </Text>
        {race.speed.description ? <Text>{race.speed.description}</Text> : null}
      </View>

      <View>
        <Text style={{ fontWeight: '600' }}>Возраст:</Text>
        <Text>Максимальный возраст: {race.age.max_age}</Text>
        {race.age.description ? <Text>{race.age.description}</Text> : null}
      </View>

      <View>
        <Text style={{ fontWeight: '600' }}>Бонусы характеристик:</Text>
        <Text>{modifiersText || '—'}</Text>
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>Особенности:</Text>
        {race.features.length === 0 ? (
          <Text>Нет явных особенностей.</Text>
        ) : (
          race.features.map((feature) => (
            <View key={feature.name} style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: '500' }}>{feature.name}</Text>
              <Text>{feature.description}</Text>
            </View>
          ))
        )}
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>Описание:</Text>
        <Text>{race.description}</Text>
      </View>
    </ScrollView>
  );
};
