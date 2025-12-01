import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { getSubraceById } from '@/features/subraces/api/getSubraceById';
import type { Subrace } from '@/features/subraces/api/types';
import { colors } from '@/shared/theme/colors';

interface SubraceDetailsProps {
  subraceId: string;
}

export const SubraceDetails: React.FC<SubraceDetailsProps> = ({ subraceId }) => {
  const router = useRouter();
  const {
    data: subrace,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Subrace>({
    queryKey: ['subraces', subraceId],
    queryFn: () => getSubraceById(subraceId),
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>Загружаю подрасу...</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Error loading subrace:', error);
    return (
      <View style={styles.centered}>
        <Text style={[styles.helperText, { color: colors.error }]}>Ошибка при загрузке подрасы.</Text>
        <Text
          onPress={() => refetch()}
          style={{ color: colors.buttonPrimary, textDecorationLine: 'underline' }}
        >
          Повторить запрос
        </Text>
      </View>
    );
  }

  if (!subrace) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>Подраса не найдена.</Text>
      </View>
    );
  }

  const modifiersText = subrace.increase_modifiers
    .map((modifier) => `${modifier.modifier} +${modifier.bonus}`)
    .join(', ');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.title}>{subrace.name}</Text>
        <Text style={styles.subtitle}>{subrace.name_in_english}</Text>
      </View>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(tabs)/library/subraces/[subraceId]/edit',
            params: { subraceId: subrace.subrace_id },
          })
        }
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>Редактировать</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Родительская раса</Text>
        <Text style={styles.sectionValue}>{subrace.race_id}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Бонусы характеристик</Text>
        <Text style={styles.sectionValue}>{modifiersText || '—'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Особенности</Text>
        {subrace.features.length === 0 ? (
          <Text style={styles.helperText}>Особенности не указаны.</Text>
        ) : (
          subrace.features.map((feature) => (
            <View key={feature.name} style={styles.featureItem}>
              <Text style={styles.featureTitle}>{feature.name}</Text>
              <Text style={styles.sectionValue}>{feature.description}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Описание</Text>
        <Text style={styles.sectionValue}>{subrace.description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    rowGap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  editButton: {
    marginTop: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: colors.buttonPrimary,
  },
  editButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '500',
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionValue: {
    color: colors.textPrimary,
    lineHeight: 20,
  },
  helperText: {
    color: colors.textSecondary,
  },
  featureItem: {
    gap: 2,
    marginBottom: 6,
  },
  featureTitle: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
