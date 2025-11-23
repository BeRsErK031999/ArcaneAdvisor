import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/features/classes/api/getClasses';
import type { Class } from '@/features/classes/api/types';

export const ClassesList: React.FC = () => {
  const router = useRouter();
  const {
    data: classes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Загружаю классы...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    console.error('Error loading classes:', error);
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>Ошибка при загрузке классов.</Text>
        <Text style={{ marginBottom: 8 }}>Проверь адрес backend и CORS.</Text>
        <Text
          onPress={() => refetch()}
          style={{ color: 'blue', textDecorationLine: 'underline' }}
        >
          Повторить запрос
        </Text>
      </SafeAreaView>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/library/classes/create')}
          style={{
            marginBottom: 16,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: '#28a745',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>+ Создать класс</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center' }}>Классов пока нет.</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Class }) => {
    const primaryMods = item.primary_modifiers.join(', ');
    const savingThrows = item.proficiencies.saving_throws.join(', ');

    return (
      <Link
        href={{ pathname: '/(tabs)/library/classes/[classId]', params: { classId: item.class_id } }}
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
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
            {item.name}
            {primaryMods && ` (${primaryMods})`}
          </Text>

          <Text style={{ marginTop: 4, fontSize: 12, color: '#555' }}>
            Спасброски: {savingThrows || '—'}
          </Text>

          <Text
            numberOfLines={3}
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
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/library/classes/create')}
        style={{
          margin: 16,
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: 'center',
          backgroundColor: '#28a745',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>+ Создать класс</Text>
      </TouchableOpacity>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.class_id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};
