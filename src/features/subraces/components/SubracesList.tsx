import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getSubraces } from '@/features/subraces/api/getSubraces';
import type { Subrace } from '@/features/subraces/api/types';

export function SubracesList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['subraces'],
    queryFn: getSubraces,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Загружаю подрасы…</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Error loading subraces:', error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке подрас.</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить запрос
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Подрас пока нет.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Subrace }) => {
    const bonuses = item.increase_modifiers
      .map((bonus) => `${bonus.modifier.toUpperCase()} +${bonus.bonus}`)
      .join(', ');

    return (
      <TouchableOpacity style={styles.card}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.name_in_english}</Text>
        <Text style={styles.meta}>Раса: {item.race_id}</Text>
        {bonuses ? <Text style={styles.meta}>Бонусы: {bonuses}</Text> : null}
        <Text numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.subrace_id}
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#111827',
  },
});
