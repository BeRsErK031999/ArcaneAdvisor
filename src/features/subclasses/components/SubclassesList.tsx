import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { getSubclasses } from '@/features/subclasses/api/getSubclasses';
import type { Subclass } from '@/features/subclasses/api/types';

export function SubclassesList() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['subclasses'],
    queryFn: getSubclasses,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Загружаю подклассы…</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Error loading subclasses:', error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке подклассов.</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить запрос
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/library/subclasses/create')}
          style={{
            margin: 16,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: '#28a745',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>+ Создать подкласс</Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>Подклассов пока нет.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Subclass }) => (
    <Link
      href={{
        pathname: '/(tabs)/library/subclasses/[subclassId]/edit',
        params: { subclassId: item.subclass_id },
      }}
      asChild
    >
      <TouchableOpacity style={styles.card}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.name_in_english}</Text>
        <Text style={styles.meta}>Класс: {item.class_id}</Text>
        <Text numberOfLines={3} style={styles.description}>
          {item.description}
        </Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/library/subclasses/create')}
        style={{
          margin: 16,
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: 'center',
          backgroundColor: '#28a745',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>+ Создать подкласс</Text>
      </TouchableOpacity>

      <FlatList
        data={data}
        keyExtractor={(item) => item.subclass_id}
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
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#111827',
  },
});
