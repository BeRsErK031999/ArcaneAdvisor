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

import { getMaterialComponents } from '@/features/material-components/api/getMaterialComponents';
import type { MaterialComponent } from '@/features/material-components/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, SubtitleText, TitleText } from '@/shared/ui/Typography';

function formatCost(cost: MaterialComponent['cost']) {
  if (!cost) return 'Стоимость: —';
  return `Стоимость: ${cost.count} ${cost.piece_type}`;
}

function formatMaterial(materialId: MaterialComponent['material_id']) {
  return materialId ? `Материал: ${materialId}` : 'Материал: —';
}

export function MaterialComponentsList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<
    MaterialComponent[],
    Error
  >({
    queryKey: ['material-components'],
    queryFn: getMaterialComponents,
  });

  const materialComponents = data ?? [];

  const showList = !isLoading && !isError && materialComponents.length > 0;
  const showEmpty = !isLoading && !isError && materialComponents.length === 0;

  return (
    <ScreenContainer>
      <TitleText>Материальные компоненты</TitleText>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю материальные компоненты…</BodyText>
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>
            Не удалось загрузить материальные компоненты
          </BodyText>
          <BodyText style={styles.errorDetails}>{error?.message}</BodyText>

          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      )}

      {showEmpty && (
        <View style={styles.centered}>
          <BodyText style={styles.helperText}>Материальных компонент пока нет</BodyText>
        </View>
      )}

      {showList && (
        <FlatList
          data={materialComponents}
          keyExtractor={(item) => item.material_component_id}
          renderItem={({ item }) => <MaterialComponentListItem component={item} />}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      )}
    </ScreenContainer>
  );
}

type MaterialComponentListItemProps = {
  component: MaterialComponent;
};

function MaterialComponentListItem({ component }: MaterialComponentListItemProps) {
  const href = {
    pathname: '/(tabs)/library/equipment/material-components/[materialComponentId]',
    params: { materialComponentId: String(component.material_component_id) },
  } satisfies Href;

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.cardHeader}>
          <BodyText style={styles.name}>{component.name}</BodyText>
          <SubtitleText style={styles.consumed}>
            {component.consumed ? 'расходуется' : 'не расходуется'}
          </SubtitleText>
        </View>

        <BodyText style={styles.meta}>{formatMaterial(component.material_id)}</BodyText>
        <BodyText style={styles.meta}>{formatCost(component.cost)}</BodyText>

        {component.description ? (
          <BodyText style={styles.description} numberOfLines={2}>
            {component.description}
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
  consumed: {
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
