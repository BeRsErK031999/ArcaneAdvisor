import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { getRaces } from '@/features/races/api/getRaces';
import type { Race } from '@/features/races/api/types';

export const RacesList: React.FC = () => {
  const {
    data: races,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['races'],
    queryFn: getRaces,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Загружаю расы...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    console.error('Error loading races:', error);
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>Ошибка при загрузке рас.</Text>
        <Text
          onPress={() => refetch()}
          style={{ color: 'blue', textDecorationLine: 'underline' }}
        >
          Повторить запрос
        </Text>
      </SafeAreaView>
    );
  }

  if (!races || races.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>Рас пока нет.</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Race }) => {
    const speed = `${item.speed.base_speed.count} ${item.speed.base_speed.unit}`;
    const subtitle = `${item.creature_type}, ${item.creature_size}, скорость ${speed}`;

    return (
      <Link
        href={{
          pathname: '/(tabs)/library/races/[raceId]',
          params: { raceId: item.race_id },
        }}
        asChild
      >
        <TouchableOpacity
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
          <Text style={{ marginTop: 2, fontSize: 12, color: '#555' }}>{subtitle}</Text>
          <Text
            numberOfLines={2}
            style={{ marginTop: 4, fontSize: 13, color: '#333' }}
          >
            {item.description}
          </Text>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={races}
        keyExtractor={(item) => item.race_id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};
