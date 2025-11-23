import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getWeapons } from '@/features/weapons/api/getWeapons';
import type { Weapon } from '@/features/weapons/api/types';

function formatDamage(damage: Weapon['damage']) {
  const dice = `${damage.dice_count}${damage.dice_type}`;
  return `${dice} ${damage.damage_type}`;
}

function formatRange(range: Weapon['weapon_range']) {
  if (!range) return 'Дистанция: —';
  const unit = range.range_unit ?? '';
  if (range.long !== null && range.normal !== null) {
    return `Дистанция: ${range.normal}/${range.long} ${unit}`.trim();
  }
  if (range.normal !== null) {
    return `Дистанция: ${range.normal} ${unit}`.trim();
  }
  return 'Дистанция: —';
}

function formatWeight(weight: Weapon['weight']) {
  if (!weight) return 'Вес: —';
  return `Вес: ${weight.count} ${weight.unit}`;
}

function formatCost(cost: Weapon['cost']) {
  if (!cost) return 'Стоимость: —';
  return `Стоимость: ${cost.count} ${cost.piece_type}`;
}

function formatProperties(properties: Weapon['properties']) {
  if (!properties || properties.length === 0) return 'Свойства: —';
  return `Свойства: ${properties.join(', ')}`;
}

export function WeaponsList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['weapons'],
    queryFn: getWeapons,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Загружаю оружие…</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Failed to load weapons:', error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке оружия</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Оружия пока нет</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Weapon }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>{item.weapon_type}</Text>
      </View>
      <Text style={styles.meta}>Тип оружия: {item.weapon_kind_id}</Text>
      <Text style={styles.meta}>Урон: {formatDamage(item.damage)}</Text>
      <Text style={styles.meta}>{formatRange(item.weapon_range)}</Text>
      <Text style={styles.meta}>{formatWeight(item.weight)}</Text>
      <Text style={styles.meta}>{formatCost(item.cost)}</Text>
      <Text style={styles.meta}>{formatProperties(item.properties)}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.weapon_id}
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
