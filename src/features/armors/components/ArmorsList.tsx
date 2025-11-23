import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getArmors } from '@/features/armors/api/getArmors';
import type { Armor } from '@/features/armors/api/types';

function formatArmorClass(armorClass: Armor['armor_class']) {
  const modifier = armorClass.modifier ? ` + ${armorClass.modifier}` : '';
  const maxBonus = armorClass.max_modifier_bonus !== null ? ` (до ${armorClass.max_modifier_bonus})` : '';
  return `AC: ${armorClass.base_class}${modifier}${maxBonus}`;
}

function formatWeight(weight?: Armor['weight']) {
  if (!weight) return 'Вес: —';
  return `Вес: ${weight.count} ${weight.unit}`;
}

function formatCost(cost?: Armor['cost']) {
  if (!cost) return 'Стоимость: —';
  return `Стоимость: ${cost.count} ${cost.piece_type}`;
}

export function ArmorsList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['armors'],
    queryFn: getArmors,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Загружаю доспехи…</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Failed to load armors:', error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке доспехов</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Доспехи пока не добавлены</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Armor }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>{item.armor_type}</Text>
      </View>
      <Text style={styles.meta}>{formatArmorClass(item.armor_class)}</Text>
      <Text style={styles.meta}>Сила: {item.strength}</Text>
      <Text style={styles.meta}>Скрытность: {item.stealth ? 'помеха' : 'без помехи'}</Text>
      <Text style={styles.meta}>{formatWeight(item.weight)}</Text>
      <Text style={styles.meta}>{formatCost(item.cost)}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.armor_id}
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
  type: {
    fontSize: 14,
    color: '#6b7280',
  },
  meta: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#111827',
    marginTop: 4,
  },
});
