import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { getFeats } from '@/features/feats/api/getFeats';
import type { Feat } from '@/features/feats/api/types';

export function FeatsList() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['feats'],
    queryFn: getFeats,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Загружаю способности…</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Error loading feats:', error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке способностей.</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить запрос
        </Text>
      </View>
    );
  }

  const feats = data ?? [];

  const renderItem = ({ item }: { item: Feat }) => {
    const armorText = item.required_armor_types.length > 0
      ? item.required_armor_types.join(', ')
      : 'нет';

    const requiredStats = item.required_modifiers
      .map((modifier) => `${modifier.modifier.toUpperCase()} ${modifier.min_value}`)
      .join(', ');

    return (
      <TouchableOpacity style={styles.card}>
        <Text style={styles.title}>
          {item.name}
          {item.caster ? ' (кастер)' : ''}
        </Text>
        <Text style={styles.meta}>Требуемые доспехи: {armorText}</Text>
        <Text style={styles.meta}>
          Требуемые статы: {requiredStats || 'нет'}
        </Text>
        <Text numberOfLines={3} style={styles.description}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/library/feats/create')}
        style={{
          margin: 16,
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: 'center',
          backgroundColor: '#28a745',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>+ Создать способность (feat)</Text>
      </TouchableOpacity>

      {feats.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.helperText}>Способностей пока нет.</Text>
        </View>
      ) : (
        <FlatList
          data={feats}
          keyExtractor={(item) => item.feat_id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
