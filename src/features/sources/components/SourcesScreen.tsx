import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getSources } from '@/features/sources/api/getSources';
import type { Source } from '@/features/sources/api/types';

export const SourcesScreen: React.FC = () => {
  const { data: sources, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sources'],
    queryFn: getSources,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Загружаю источники...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    console.error('Error loading sources:', error);
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>Ошибка при загрузке источников.</Text>
        <Text style={{ marginBottom: 8 }}>Проверьте подключение к серверу.</Text>
        <Text
          onPress={() => refetch()}
          style={{ color: 'blue', textDecorationLine: 'underline' }}
        >
          Повторить запрос
        </Text>
      </SafeAreaView>
    );
  }

  if (!sources || sources.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>Источников пока нет.</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Source }) => (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
      }}
    >
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
      <Text style={{ color: '#555', marginTop: 2 }}>{item.name_in_english}</Text>
      <Text style={{ marginTop: 6, color: '#333' }}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={sources}
        keyExtractor={(item) => item.source_id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      />
    </SafeAreaView>
  );
};
