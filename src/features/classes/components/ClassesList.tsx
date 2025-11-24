import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/features/classes/api/getClasses';
import type { Class } from '@/features/classes/api/types';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { colors } from '@/shared/theme/colors';

export const ClassesList: React.FC = () => {
  const router = useRouter();
  const {
    data: classes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
        <Text style={styles.helperText}>Загружаю классы...</Text>
      </ScreenContainer>
    );
  }

  if (isError) {
    console.error('Error loading classes:', error);
    return (
      <ScreenContainer style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке классов.</Text>
        <Text style={styles.helperText}>Проверь адрес backend и CORS.</Text>
        <Text onPress={() => refetch()} style={styles.linkText}>
          Повторить запрос
        </Text>
      </ScreenContainer>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <ScreenContainer>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/library/classes/create')}
          style={[styles.createButton, { marginBottom: 16 }]}
        >
          <Text style={styles.createButtonText}>+ Создать класс</Text>
        </TouchableOpacity>

        <Text style={styles.helperText}>Классов пока нет.</Text>
      </ScreenContainer>
    );
  }

  const renderItem = ({ item }: { item: Class }) => {
    const primaryMods = item.primary_modifiers.join(', ');
    const savingThrows = item.proficiencies.saving_throws.join(', ');

    return (
      <Link
        href={{ pathname: '/(tabs)/library/classes/[classId]', params: { classId: item.class_id } }}
        asChild
      >
        <TouchableOpacity style={styles.card}>
          <Text style={styles.name}>
            {item.name}
            {primaryMods && ` (${primaryMods})`}
          </Text>

          <Text style={styles.metaText}>Спасброски: {savingThrows || '—'}</Text>

          <Text numberOfLines={3} style={styles.description}>
            {item.description}
          </Text>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <ScreenContainer>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/library/classes/create')}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>+ Создать класс</Text>
      </TouchableOpacity>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.class_id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 8,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  linkText: {
    color: colors.buttonPrimary,
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  createButton: {
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.buttonPrimary,
    borderWidth: 1,
    borderColor: colors.buttonPrimaryHover,
  },
  createButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.textPrimary,
  },
  metaText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  separator: {
    height: 12,
  },
});
