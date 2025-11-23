import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getClassFeatures } from '@/features/class-features/api/getClassFeatures';
import type { ClassFeature } from '@/features/class-features/api/types';

export function ClassFeaturesList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['class-features'],
    queryFn: getClassFeatures,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Загружаю фичи классов…</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Error loading class features:', error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке фич классов.</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить запрос
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Фичи классов пока не добавлены.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: ClassFeature }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>
        {item.name} (уровень {item.level})
      </Text>
      <Text style={styles.subtitle}>{item.class_id}</Text>
      <Text numberOfLines={3} style={styles.description}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.feature_id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  helperText: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 16,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#111827',
  },
});
