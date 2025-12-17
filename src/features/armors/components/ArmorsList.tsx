import React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';

import { getArmors } from '@/features/armors/api/getArmors';
import type { Armor } from '@/features/armors/api/types';
import { getMaterials } from '@/features/materials/api/getMaterials';
import type { Material } from '@/features/materials/api/types';
import { getArmorTypes, type ArmorTypeOption } from '@/features/armors/api/getArmorTypes';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';

function formatArmorClass(armorClass: Armor['armor_class']) {
  const modifier = armorClass.modifier ? ` + ${armorClass.modifier}` : '';
  const maxBonus =
    armorClass.modifier && armorClass.max_modifier_bonus !== null
      ? ` (до ${armorClass.max_modifier_bonus})`
      : '';
  return `Класс: ${armorClass.base_class}${modifier}${maxBonus}`;
}

function formatWeight(weight: Armor['weight']) {
  if (!weight) return 'Вес: —';
  return `Вес: ${weight.count} ${weight.unit}`;
}

function formatCost(cost: Armor['cost']) {
  if (!cost) return 'Стоимость: —';
  return `Стоимость: ${cost.count} ${cost.piece_type}`;
}

export function ArmorsList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<Armor[], Error>(
    {
      queryKey: ['armors'],
      queryFn: getArmors,
    },
  );

  const { data: materials } = useQuery<Material[]>({
    queryKey: ['materials'],
    queryFn: getMaterials,
  });

  const { data: armorTypes } = useQuery<ArmorTypeOption[]>({
    queryKey: ['armor-types'],
    queryFn: getArmorTypes,
  });

  const materialMap = React.useMemo(() => {
    if (!materials) return new Map<string, string>();
    return new Map(materials.map((item) => [item.material_id, item.name]));
  }, [materials]);

  const armorTypeLabels = React.useMemo(() => {
    if (!armorTypes) return new Map<string, string>();
    return new Map(armorTypes.map((item) => [item.key, item.label]));
  }, [armorTypes]);

  const armors = data ?? [];
  const showList = !isLoading && !isError && armors.length > 0;
  const showEmpty = !isLoading && !isError && armors.length === 0;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <TitleText>Доспехи</TitleText>

        <Link href="/(tabs)/library/equipment/armors/create" asChild>
          <Pressable style={styles.createButton}>
            <BodyText style={styles.createButtonText}>+ Создать</BodyText>
          </Pressable>
        </Link>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю доспехи…</BodyText>
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>Ошибка при загрузке доспехов</BodyText>
          <BodyText style={styles.errorDetails}>{error?.message ?? 'Неизвестная ошибка'}</BodyText>

          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      )}

      {showEmpty && (
        <View style={styles.centered}>
          <BodyText style={styles.helperText}>Доспехи пока не добавлены</BodyText>

          <Link href="/(tabs)/library/equipment/armors/create" asChild>
            <Pressable style={styles.createButtonWide}>
              <BodyText style={styles.createButtonText}>Создать первый доспех</BodyText>
            </Pressable>
          </Link>
        </View>
      )}

      {showList && (
        <FlatList
          data={armors}
          keyExtractor={(item) => item.armor_id}
          renderItem={({ item }) => (
            <ArmorListItem
              armor={item}
              materialName={materialMap.get(item.material_id ?? '')}
              typeLabel={armorTypeLabels.get(item.armor_type) ?? item.armor_type}
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

type ArmorListItemProps = {
  armor: Armor;
  materialName?: string;
  typeLabel: string;
};

function ArmorListItem({ armor, materialName, typeLabel }: ArmorListItemProps) {
  const href = {
    pathname: '/(tabs)/library/equipment/armors/[armorId]',
    params: { armorId: String(armor.armor_id) },
  } satisfies Href;

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.cardHeader}>
          <BodyText style={styles.name}>{armor.name}</BodyText>
          <BodyText style={styles.type}>{typeLabel}</BodyText>
        </View>
        <BodyText style={styles.meta}>{formatArmorClass(armor.armor_class)}</BodyText>
        <BodyText style={styles.meta}>Сила: {armor.strength}</BodyText>
        <BodyText style={styles.meta}>
          Скрытность: {armor.stealth ? 'помеха' : 'без помехи'}
        </BodyText>
        <BodyText style={styles.meta}>{formatWeight(armor.weight)}</BodyText>
        <BodyText style={styles.meta}>{formatCost(armor.cost)}</BodyText>
        <BodyText style={styles.meta}>Материал: {materialName ?? '—'}</BodyText>
        {armor.description ? (
          <BodyText style={styles.description} numberOfLines={2}>
            {armor.description}
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
    marginBottom: 16,
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
  listContainer: {
    paddingBottom: 24,
    rowGap: 12,
  },
  separator: {
    height: 12,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  createButtonWide: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  createButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  cardPressed: {
    backgroundColor: colors.surfaceElevated ?? colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    color: colors.textPrimary,
  },
  type: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 4,
  },
});
