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

import { getWeaponProperties } from '@/features/weapon-properties/api/getWeaponProperties';
import { getWeaponPropertyNames } from '@/features/weapon-properties/api/getWeaponPropertyNames';
import type { WeaponProperty, WeaponPropertyNameOption } from '@/features/weapon-properties/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';

export function WeaponPropertiesList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<
    WeaponProperty[],
    Error
  >({
    queryKey: ['weapon-properties'],
    queryFn: () => getWeaponProperties(),
  });

  const { data: propertyNames } = useQuery<WeaponPropertyNameOption[], Error>({
    queryKey: ['weapon-property-names'],
    queryFn: getWeaponPropertyNames,
  });

  const propertyNamesMap = React.useMemo(() => {
    if (!propertyNames) return {} as Record<string, string>;

    return propertyNames.reduce<Record<string, string>>((acc, option) => {
      acc[option.key] = option.label;
      return acc;
    }, {});
  }, [propertyNames]);

  const properties = data ?? [];

  const showList = !isLoading && !isError && properties.length > 0;
  const showEmpty = !isLoading && !isError && properties.length === 0;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <TitleText>Свойства оружия</TitleText>

        <Link href="/(tabs)/library/equipment/weapon-properties/create" asChild>
          <Pressable style={styles.createButton}>
            <BodyText style={styles.createButtonText}>+ Создать</BodyText>
          </Pressable>
        </Link>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю свойства оружия…</BodyText>
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>
            Ошибка при загрузке свойств оружия
          </BodyText>
          <BodyText style={styles.errorDetails}>
            {error?.message ?? 'Неизвестная ошибка'}
          </BodyText>

          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      )}

      {showEmpty && (
        <View style={styles.centered}>
          <BodyText style={styles.helperText}>Свойств оружия пока нет</BodyText>

          <Link href="/(tabs)/library/equipment/weapon-properties/create" asChild>
            <Pressable style={styles.createButtonWide}>
              <BodyText style={styles.createButtonText}>Создать свойство</BodyText>
            </Pressable>
          </Link>
        </View>
      )}

      {showList && (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.weapon_property_id}
          renderItem={({ item }) => (
            <WeaponPropertyListItem
              property={item}
              readableLabel={propertyNamesMap[item.name]}
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

type WeaponPropertyListItemProps = {
  property: WeaponProperty;
  readableLabel?: string;
};

function WeaponPropertyListItem({ property, readableLabel }: WeaponPropertyListItemProps) {
  const href = {
    pathname: '/(tabs)/library/equipment/weapon-properties/[weaponPropertyId]',
    params: { weaponPropertyId: String(property.weapon_property_id) },
  } satisfies Href;

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <BodyText style={styles.name}>{readableLabel ?? property.name}</BodyText>
        <BodyText style={styles.key}>{property.name}</BodyText>
        <BodyText style={styles.description} numberOfLines={2}>
          {property.description}
        </BodyText>
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
  retryButton: {
    marginTop: 12,
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
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    rowGap: 8,
  },
  cardPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  key: {
    fontSize: 12,
    color: colors.textMuted,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
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
    marginTop: 8,
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
});
