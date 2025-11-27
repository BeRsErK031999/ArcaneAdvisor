import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getFeats } from '@/features/feats/api/getFeats';
import type { Feat } from '@/features/feats/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';

export function FeatsList() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['feats'],
    queryFn: getFeats,
  });

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <Text style={styles.helperText}>Загружаю способности…</Text>
      </ScreenContainer>
    );
  }

  if (isError) {
    console.error('Error loading feats:', error);
    return (
      <ScreenContainer style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке способностей.</Text>
        <Text style={styles.linkText} onPress={() => refetch()}>
          Повторить запрос
        </Text>
      </ScreenContainer>
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
      <Link
        href={{ pathname: '/(tabs)/library/feats/[featId]/edit', params: { featId: item.feat_id } }}
        asChild
      >
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
      </Link>
    );
  };

  return (
    <ScreenContainer>
      <TouchableOpacity onPress={() => router.push('/(tabs)/library/feats/create')} style={styles.createButton}>
        <Text style={styles.createButtonText}>+ Создать способность (feat)</Text>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
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
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
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
    alignItems: 'center',
    backgroundColor: colors.buttonPrimary,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
  },
  createButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
});
