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

import { getWeaponKinds } from '@/features/weapon-kinds/api/getWeaponKinds';
import { getWeaponTypes } from '@/features/weapon-kinds/api/getWeaponTypes';
import type {
  WeaponKind,
  WeaponTypeOption,
} from '@/features/weapon-kinds/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';

export function WeaponKindsList() {
  const {
    data: weaponKinds,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<WeaponKind[], Error>({
    queryKey: ['weapon-kinds'],
    queryFn: () => getWeaponKinds(),
  });

  const {
    data: weaponTypes,
    isLoading: isLoadingWeaponTypes,
    isError: isErrorWeaponTypes,
    error: weaponTypesError,
    refetch: refetchWeaponTypes,
  } = useQuery<WeaponTypeOption[], Error>({
    queryKey: ['weapon-types'],
    queryFn: getWeaponTypes,
  });

  const items = weaponKinds ?? [];
  const showList = !isLoading && !isError && items.length > 0;
  const showEmpty = !isLoading && !isError && items.length === 0;

  const getTypeLabel = React.useCallback(
    (weaponType: string) =>
      weaponTypes?.find((option) => option.key === weaponType)?.label ?? weaponType,
    [weaponTypes],
  );

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <TitleText>Типы оружия</TitleText>

        <Link href="/(tabs)/library/equipment/weapon-kinds/create" asChild>
          <Pressable style={styles.createButton}>
            <BodyText style={styles.createButtonText}>+ Создать</BodyText>
          </Pressable>
        </Link>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю типы оружия…</BodyText>
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>
            Не удалось загрузить типы оружия
          </BodyText>
          <BodyText style={styles.errorDetails}>
            {error?.message ?? 'Неизвестная ошибка'}
          </BodyText>

          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      )}

      {!isLoading && isErrorWeaponTypes && (
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>
            Не удалось загрузить словарь типов оружия
          </BodyText>
          <BodyText style={styles.errorDetails}>
            {weaponTypesError?.message ?? 'Неизвестная ошибка'}
          </BodyText>

          <Pressable
            style={styles.retryButton}
            onPress={() => refetchWeaponTypes()}
          >
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      )}

      {showEmpty && (
        <View style={styles.centered}>
          <BodyText style={styles.helperText}>Типов оружия пока нет</BodyText>

          <Link href="/(tabs)/library/equipment/weapon-kinds/create" asChild>
            <Pressable style={styles.createButtonWide}>
              <BodyText style={styles.createButtonText}>
                + Создать первый тип оружия
              </BodyText>
            </Pressable>
          </Link>
        </View>
      )}

      {showList && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.weapon_kind_id}
          renderItem={({ item }) => (
            <WeaponKindListItem
              weaponKind={item}
              weaponTypeLabel={getTypeLabel(item.weapon_type)}
              isLoadingWeaponTypes={isLoadingWeaponTypes}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
    </ScreenContainer>
  );
}

type WeaponKindListItemProps = {
  weaponKind: WeaponKind;
  weaponTypeLabel: string;
  isLoadingWeaponTypes: boolean;
};

function WeaponKindListItem({
  weaponKind,
  weaponTypeLabel,
  isLoadingWeaponTypes,
}: WeaponKindListItemProps) {
  const href: Href = {
    pathname: '/(tabs)/library/equipment/weapon-kinds/[weaponKindId]',
    params: { weaponKindId: weaponKind.weapon_kind_id },
  };

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.cardHeader}>
          <BodyText style={styles.name}>{weaponKind.name}</BodyText>
          <BodyText style={styles.type}>
            {isLoadingWeaponTypes ? '…' : weaponTypeLabel}
          </BodyText>
        </View>

        {weaponKind.description ? (
          <BodyText style={styles.description} numberOfLines={2}>
            {weaponKind.description}
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
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  createButtonWide: {
    marginTop: 12,
    paddingVertical: 10,
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
    borderRadius: 8,
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
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  type: {
    fontSize: 14,
    color: colors.textMuted,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
