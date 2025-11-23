import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getMaterialComponents } from '@/features/material-components/api/getMaterialComponents';
import type { MaterialComponent } from '@/features/material-components/api/types';

function formatCost(cost: MaterialComponent['cost']) {
  if (!cost) return 'Стоимость: —';
  return `Стоимость: ${cost.count} ${cost.piece_type}`;
}

function formatMaterial(materialId: MaterialComponent['material_id']) {
  return materialId ? `Материал: ${materialId}` : 'Материал: —';
}

export function MaterialComponentsList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['material-components'],
    queryFn: getMaterialComponents,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Загружаю материальные компоненты…</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Failed to load material components:', error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке компонент</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Материальных компонент пока нет</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: MaterialComponent }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>{item.consumed ? 'расходуется' : 'не расходуется'}</Text>
      </View>
      <Text style={styles.meta}>{formatMaterial(item.material_id)}</Text>
      <Text style={styles.meta}>{formatCost(item.cost)}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.material_component_id}
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
