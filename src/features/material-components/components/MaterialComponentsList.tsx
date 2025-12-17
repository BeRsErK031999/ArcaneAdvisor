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
import { getMaterials } from '@/features/materials/api/getMaterials';
import type { Material } from '@/features/materials/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, SubtitleText, TitleText } from '@/shared/ui/Typography';

function formatCost(cost: MaterialComponent['cost']) {
  if (!cost) return 'Стоимость: —';
  return `Стоимость: ${cost.count} ${cost.piece_type}`;
}

export function MaterialComponentsList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<
    MaterialComponent[],
    Error
  >({
    queryKey: ['material-components'],
    queryFn: getMaterialComponents,
  });

  const {
    data: materials,
    isError: isMaterialsError,
    error: materialsError,
    refetch: refetchMaterials,
    isLoading: isLoadingMaterials,
  } = useQuery<Material[], Error>({
    queryKey: ['materials'],
    queryFn: getMaterials,
  });

  const materialComponents = data ?? [];
  const materialsMap = React.useMemo(() => {
    if (!materials) return {};
    return materials.reduce<Record<string, string>>((acc, material) => {
      acc[material.material_id] = material.name;
      return acc;
    }, {});
  }, [materials]);

  const showList = !isLoading && !isError && materialComponents.length > 0;
  const showEmpty = !isLoading && !isError && materialComponents.length === 0;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <TitleText>Материальные компоненты</TitleText>

        <Link href="/(tabs)/library/equipment/material-components/create" asChild>
          <Pressable style={styles.createButton}>
            <BodyText style={styles.createButtonText}>+ Создать</BodyText>
          </Pressable>
        </Link>
      </View>

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

      {!isLoading && !isError && isMaterialsError ? (
        <View style={styles.warningBlock}>
          <BodyText style={styles.warningTitle}>
            Не удалось загрузить справочник материалов. Отображаю идентификаторы.
          </BodyText>
          <Pressable style={styles.retryButtonGhost} onPress={() => refetchMaterials()}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      ) : null}

      {showEmpty && (
        <View style={styles.centered}>
          <BodyText style={styles.helperText}>Материальных компонентов пока нет</BodyText>
          <Link href="/(tabs)/library/equipment/material-components/create" asChild>
            <Pressable style={styles.createButtonWide}>
              <BodyText style={styles.createButtonText}>Создать первый компонент</BodyText>
            </Pressable>
          </Link>
        </View>
      )}

      {showList && (
        <FlatList
          data={materialComponents}
          keyExtractor={(item) => item.material_component_id}
          renderItem={({ item }) => (
            <MaterialComponentListItem
              component={item}
              materialName={item.material_id ? materialsMap[item.material_id] : null}
              isLoadingMaterials={isLoadingMaterials}
              materialsError={isMaterialsError ? materialsError : null}
            />
          )}
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
  materialName: string | null;
  isLoadingMaterials: boolean;
  materialsError: Error | null;
};

function MaterialComponentListItem({
  component,
  materialName,
  isLoadingMaterials,
  materialsError,
}: MaterialComponentListItemProps) {
  const href = {
    pathname: '/(tabs)/library/equipment/material-components/[materialComponentId]',
    params: { materialComponentId: String(component.material_component_id) },
  } satisfies Href;

  const materialDisplay = React.useMemo(() => {
    if (isLoadingMaterials) {
      return 'Материал: —';
    }

    if (component.material_id && materialName) {
      return `Материал: ${materialName}`;
    }

    if (component.material_id && !materialName && materialsError) {
      return `Материал: ${component.material_id}`;
    }

    return 'Материал: —';
  }, [component.material_id, isLoadingMaterials, materialName, materialsError]);

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.cardHeader}>
          <BodyText style={styles.name}>{component.name}</BodyText>
          <SubtitleText style={styles.consumed}>
            {component.consumed ? 'расходуется' : 'не расходуется'}
          </SubtitleText>
        </View>

        <BodyText style={styles.meta}>{materialDisplay}</BodyText>
        <BodyText style={styles.meta}>{formatCost(component.cost)}</BodyText>

        {!isLoadingMaterials && materialsError ? (
          <BodyText style={styles.warningText}>Справочник материалов не загрузился</BodyText>
        ) : null}

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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  createButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '600',
  },
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
  retryButtonGhost: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
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
  warningText: {
    color: colors.warning,
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 8,
  },
  warningBlock: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.surface,
    rowGap: 8,
  },
  warningTitle: {
    color: colors.warning,
  },
});
