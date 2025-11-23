import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { getSpells } from '@/features/spells/api/getSpells';
import { Spell } from '@/features/spells/api/types';

export function SpellsList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['spells'],
    queryFn: getSpells,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Загружаю заклинания…</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Failed to load spells:', error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке заклинаний</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Заклинаний пока нет</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Spell }) => (
    <Link
      href={{
        pathname: '/(tabs)/library/spells/[spellId]',
        params: { spellId: item.spell_id },
      }}
      asChild
    >
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.level}>Уровень: {item.level}</Text>
        </View>
        <Text style={styles.school}>Школа: {item.school}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.spell_id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
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
  listContainer: {
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  level: {
    fontSize: 14,
    color: '#6b7280',
  },
  school: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#111827',
  },
});
