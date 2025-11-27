import { getRaces } from '@/features/races/api/getRaces';
import type { Race } from '@/features/races/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const RacesList: React.FC = () => {
  const router = useRouter();
  const {
    data: races,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['races'],
    queryFn: getRaces,
  });

  const renderCreateButton = () => (
    <TouchableOpacity onPress={() => router.push('/(tabs)/library/races/create')} style={styles.createButton}>
      <Text style={styles.createButtonText}>+ Создать расу</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
        <Text style={styles.helperText}>Загружаю расы...</Text>
      </ScreenContainer>
    );
  }

  if (isError) {
    console.error('Error loading races:', error);
    return (
      <ScreenContainer style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке рас.</Text>
        <Text onPress={() => refetch()} style={styles.linkText}>
          Повторить запрос
        </Text>
      </ScreenContainer>
    );
  }

  if (!races || races.length === 0) {
    return (
      <ScreenContainer>
        {renderCreateButton()}
        <Text style={styles.helperText}>Рас пока нет.</Text>
      </ScreenContainer>
    );
  }

  const renderItem = ({ item }: { item: Race }) => {
    const speed = `${item.speed.base_speed.count} ${item.speed.base_speed.unit}`;
    const subtitle = `${item.creature_type}, ${item.creature_size}, скорость ${speed}`;

    return (
      <Link
        href={{
          pathname: '/(tabs)/library/races/[raceId]',
          params: { raceId: item.race_id },
        }}
        asChild
      >
        <TouchableOpacity style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.metaText}>{subtitle}</Text>
          <Text numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <ScreenContainer>
      {renderCreateButton()}
      <FlatList
        data={races}
        keyExtractor={(item) => item.race_id}
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
    rowGap: 12,
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
    borderColor: colors.buttonPrimary,
  },
  createButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
  card: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.textPrimary,
  },
  metaText: {
    marginTop: 2,
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
