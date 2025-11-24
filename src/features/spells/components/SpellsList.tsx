import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { getSpells } from '@/features/spells/api/getSpells';
import { Spell } from '@/features/spells/api/types';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { colors } from '@/shared/theme/colors';

export function SpellsList() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['spells'],
    queryFn: getSpells,
  });

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <Text style={styles.helperText}>Загружаю заклинания…</Text>
      </ScreenContainer>
    );
  }

  if (isError) {
    console.error('Failed to load spells:', error);
    return (
      <ScreenContainer style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке заклинаний</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить
        </Text>
      </ScreenContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ScreenContainer style={styles.centered}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/library/spells/create')} style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Создать заклинание</Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>Заклинаний пока нет</Text>
      </ScreenContainer>
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
    <ScreenContainer>
      <TouchableOpacity onPress={() => router.push('/(tabs)/library/spells/create')} style={styles.createButton}>
        <Text style={styles.createButtonText}>+ Создать заклинание</Text>
      </TouchableOpacity>
      <FlatList
        data={data}
        keyExtractor={(item) => item.spell_id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    rowGap: 12,
  },
  helperText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  linkText: {
    color: colors.buttonPrimary,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    rowGap: 12,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
  },
  level: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  school: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
  },
  createButton: {
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    borderWidth: 1,
    borderColor: colors.buttonPrimaryHover,
    alignItems: 'center',
  },
  createButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
});
