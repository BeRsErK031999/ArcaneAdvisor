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

import { getWeapons } from '@/features/weapons/api/getWeapons';
import type { Weapon } from '@/features/weapons/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';

function formatDamage(damage: Weapon['damage']) {
  const base = `${damage.dice.count}d${damage.dice.dice_type} ${damage.damage_type}`;
  if (damage.bonus_damage) {
    return `${base} +${damage.bonus_damage}`;
  }
  return base;
}

function formatWeight(weight: Weapon['weight']) {
  if (!weight) return 'Вес: —';
  return `Вес: ${weight.count} ${weight.unit}`;
}

function formatCost(cost: Weapon['cost']) {
  if (!cost) return 'Стоимость: —';
  return `Стоимость: ${cost.count} ${cost.piece_type}`;
}

export function WeaponsList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<Weapon[], Error>(
    {
      queryKey: ['weapons'],
      queryFn: getWeapons,
    },
  );

  const weapons = data ?? [];
  const showList = !isLoading && !isError && weapons.length > 0;
  const showEmpty = !isLoading && !isError && weapons.length === 0;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <TitleText>Оружие</TitleText>

        <Link href="/(tabs)/library/equipment/weapons/create" asChild>
          <Pressable style={styles.createButton}>
            <BodyText style={styles.createButtonText}>+ Создать</BodyText>
          </Pressable>
        </Link>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю оружие…</BodyText>
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>Ошибка при загрузке оружия</BodyText>
          <BodyText style={styles.errorDetails}>{error?.message ?? 'Неизвестная ошибка'}</BodyText>

          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      )}

      {showEmpty && (
        <View style={styles.centered}>
          <BodyText style={styles.helperText}>Оружия пока нет</BodyText>

          <Link href="/(tabs)/library/equipment/weapons/create" asChild>
            <Pressable style={styles.createButtonWide}>
              <BodyText style={styles.createButtonText}>+ Создать оружие</BodyText>
            </Pressable>
          </Link>
        </View>
      )}

      {showList && (
        <FlatList
          data={weapons}
          keyExtractor={(item) => item.weapon_id}
          renderItem={({ item }) => <WeaponListItem weapon={item} />}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      )}
    </ScreenContainer>
  );
}

type WeaponListItemProps = { weapon: Weapon };

function WeaponListItem({ weapon }: WeaponListItemProps) {
  const href = {
    pathname: '/(tabs)/library/equipment/weapons/[weaponId]',
    params: { weaponId: String(weapon.weapon_id) },
  } satisfies Href;

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.cardHeader}>
          <BodyText style={styles.name}>{weapon.name}</BodyText>
          <BodyText style={styles.type}>{weapon.weapon_kind_id}</BodyText>
        </View>
        <BodyText style={styles.meta}>Урон: {formatDamage(weapon.damage)}</BodyText>
        <BodyText style={styles.meta}>{formatWeight(weapon.weight)}</BodyText>
        <BodyText style={styles.meta}>{formatCost(weapon.cost)}</BodyText>
        {weapon.description ? (
          <BodyText style={styles.description} numberOfLines={2}>
            {weapon.description}
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
    justifyContent: 'center',
    rowGap: 12,
  },
  helperText: {
    marginTop: 4,
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
  listContainer: {
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  createButtonWide: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  createButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  type: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
  },
});
