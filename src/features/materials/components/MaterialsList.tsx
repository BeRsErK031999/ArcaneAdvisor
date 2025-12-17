import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';

import { getMaterials } from '@/features/materials/api/getMaterials';
import type { Material } from '@/features/materials/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, SubtitleText, TitleText } from '@/shared/ui/Typography';

function formatWeight(weight: Material['weight']) {
  if (!weight) return 'Вес: —';
  return `Вес: ${weight.count} ${weight.unit}`;
}

function formatCost(cost: Material['cost']) {
  if (!cost) return 'Стоимость: —';
  return `Стоимость: ${cost.count} ${cost.piece_type}`;
}

export function MaterialsList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<
    Material[],
    Error
  >({
    queryKey: ['materials'],
    queryFn: getMaterials,
  });

  const materials = data ?? [];

  const showList = !isLoading && !isError && materials.length > 0;
  const showEmpty = !isLoading && !isError && materials.length === 0;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <TitleText>Материалы</TitleText>

        <Link href="/(tabs)/library/equipment/materials/create" asChild>
          <Pressable style={styles.createButton}>
            <BodyText style={styles.createButtonText}>+ Создать</BodyText>
          </Pressable>
        </Link>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю материалы…</BodyText>
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>
            Не удалось загрузить материалы
          </BodyText>
          <BodyText style={styles.errorDetails}>{error?.message}</BodyText>

          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      )}

      {showEmpty && (
        <View style={styles.centered}>
          <BodyText style={styles.helperText}>Материалов пока нет</BodyText>

          <Link href="/(tabs)/library/equipment/materials/create" asChild>
            <Pressable style={styles.createButtonWide}>
              <BodyText style={styles.createButtonText}>+ Создать первый материал</BodyText>
            </Pressable>
          </Link>
        </View>
      )}

      {showList && (
        <FlatList
          data={materials}
          keyExtractor={(item) => item.material_id}
          renderItem={({ item }) => <MaterialListItem material={item} />}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      )}
    </ScreenContainer>
  );
}

type MaterialListItemProps = {
  material: Material;
};

function MaterialListItem({ material }: MaterialListItemProps) {
  const href = {
    pathname: '/(tabs)/library/equipment/materials/[materialId]',
    params: { materialId: String(material.material_id) },
  } satisfies Href;

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.cardHeader}>
          <BodyText style={styles.name}>{material.name}</BodyText>
          <SubtitleText style={styles.rarity}>{material.rarity}</SubtitleText>
        </View>

        <BodyText style={styles.meta}>{formatWeight(material.weight)}</BodyText>
        <BodyText style={styles.meta}>{formatCost(material.cost)}</BodyText>

        {material.description ? (
          <BodyText style={styles.description} numberOfLines={2}>
            {material.description}
          </BodyText>
        ) : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  centered: {
    marginTop: 32,
    alignItems: 'center',
    rowGap: 12,
  },
  helperText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
  },
  errorDetails: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  retryButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  createButtonWide: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  createButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 24,
    rowGap: 12,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  cardPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  rarity: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 8,
  },
});
