import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getClassLevels } from '@/features/class-levels/api/getClassLevels';
import type { ClassLevel } from '@/features/class-levels/api/types';

export function ClassLevelsList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['class-levels'],
    queryFn: getClassLevels,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Загружаю уровни классов…</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Error loading class levels:', error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке уровней классов.</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить запрос
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Уровни классов пока не добавлены.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: ClassLevel }) => {
    const spellSlotsText = item.spell_slots && item.spell_slots.length > 0
      ? item.spell_slots.join(', ')
      : '—';

    const knowledgeValues = [
      item.number_cantrips_know,
      item.number_spells_know,
      item.number_arcanums_know,
    ];
    const hasKnowledgeInfo = knowledgeValues.some((value) => value !== null);
    const knowledgeText = knowledgeValues
      .map((value) => (value !== null ? value : '—'))
      .join('/');

    return (
      <TouchableOpacity style={styles.card}>
        <Text style={styles.title}>
          Класс {item.class_id} — уровень {item.level}
        </Text>
        <Text style={styles.meta}>Ячейки заклинаний: {spellSlotsText}</Text>
        {hasKnowledgeInfo && (
          <Text style={styles.meta}>Знает cantrips/spells/arcanums: {knowledgeText}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.class_level_id}
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
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
});
