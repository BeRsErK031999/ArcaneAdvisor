import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteWeapon } from '@/features/weapons/api/deleteWeapon';
import { getWeaponById } from '@/features/weapons/api/getWeaponById';
import type { Weapon } from '@/features/weapons/api/types';
import { getWeaponKinds } from '@/features/weapon-kinds/api/getWeaponKinds';
import type { WeaponKind } from '@/features/weapon-kinds/api/types';
import { getWeaponProperties } from '@/features/weapon-properties/api/getWeaponProperties';
import type { WeaponProperty } from '@/features/weapon-properties/api/types';
import { getDamageTypes } from '@/features/dictionaries/api/getDamageTypes';
import { getDiceTypes } from '@/features/dictionaries/api/getDiceTypes';
import { getWeightUnits } from '@/features/dictionaries/api/getWeightUnits';
import { getPieceTypes } from '@/features/dictionaries/api/getPieceTypes';
import { getMaterials } from '@/features/materials/api/getMaterials';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';
import { BackButton } from '@/shared/ui/BackButton';

interface WeaponDetailsProps {
  weaponId?: string;
}

export function WeaponDetails({ weaponId }: WeaponDetailsProps) {
  const params = useLocalSearchParams();
  const resolvedWeaponId = weaponId ?? String(params.weaponId ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: weapon,
    isLoading: isLoadingWeapon,
    isError: isErrorWeapon,
    error: weaponError,
    refetch: refetchWeapon,
  } = useQuery<Weapon, Error>({
    queryKey: ['weapons', resolvedWeaponId],
    queryFn: () => getWeaponById(resolvedWeaponId),
    enabled: Boolean(resolvedWeaponId),
  });

  const weaponKindsQuery = useQuery<WeaponKind[], Error>({
    queryKey: ['weapon-kinds'],
    queryFn: () => getWeaponKinds(),
  });
  const weaponPropertiesQuery = useQuery<WeaponProperty[], Error>({
    queryKey: ['weapon-properties'],
    queryFn: () => getWeaponProperties(),
  });
  const damageTypesQuery = useQuery({ queryKey: ['damage-types'], queryFn: getDamageTypes });
  const diceTypesQuery = useQuery({ queryKey: ['dice-types'], queryFn: getDiceTypes });
  const weightUnitsQuery = useQuery({ queryKey: ['weight-units'], queryFn: getWeightUnits });
  const pieceTypesQuery = useQuery({ queryKey: ['piece-types'], queryFn: getPieceTypes });
  const materialsQuery = useQuery({ queryKey: ['materials'], queryFn: getMaterials });

  const isLoadingDictionaries =
    weaponKindsQuery.isLoading ||
    weaponPropertiesQuery.isLoading ||
    damageTypesQuery.isLoading ||
    diceTypesQuery.isLoading ||
    weightUnitsQuery.isLoading ||
    pieceTypesQuery.isLoading ||
    materialsQuery.isLoading;

  const hasDictionaryError =
    weaponKindsQuery.isError ||
    weaponPropertiesQuery.isError ||
    damageTypesQuery.isError ||
    diceTypesQuery.isError ||
    weightUnitsQuery.isError ||
    pieceTypesQuery.isError ||
    materialsQuery.isError;

  const deleteMutation = useMutation({
    mutationFn: () => deleteWeapon(resolvedWeaponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapons'] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert('Удалить оружие', 'Вы уверены, что хотите удалить оружие?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  const handleEdit = () => {
    router.push({
      pathname: '/(tabs)/library/equipment/weapons/[weaponId]/edit',
      params: { weaponId: resolvedWeaponId },
    });
  };

  if (isLoadingWeapon || isLoadingDictionaries) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю оружие…</BodyText>
      </ScreenContainer>
    );
  }

  if (isErrorWeapon || hasDictionaryError) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>Не удалось загрузить данные</BodyText>
        {isErrorWeapon && weaponError ? (
          <BodyText style={styles.errorDetails}>{weaponError.message}</BodyText>
        ) : null}

        <Pressable
          style={styles.retryButton}
          onPress={() => {
            refetchWeapon();
            weaponKindsQuery.refetch();
            weaponPropertiesQuery.refetch();
            damageTypesQuery.refetch();
            diceTypesQuery.refetch();
            weightUnitsQuery.refetch();
            pieceTypesQuery.refetch();
            materialsQuery.refetch();
          }}
        >
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!weapon) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Оружие не найдено.</BodyText>
      </ScreenContainer>
    );
  }

  const weaponKindName = weaponKindsQuery.data?.find(
    (kind) => kind.weapon_kind_id === weapon.weapon_kind_id,
  )?.name;
  const materialName = materialsQuery.data?.find(
    (material) => material.material_id === weapon.material_id,
  )?.name;
  const propertyNames = weapon.weapon_property_ids
    .map(
      (id) =>
        weaponPropertiesQuery.data?.find((property) => property.weapon_property_id === id)?.name ??
        id,
    )
    .filter(Boolean);

  const damageTypeLabel = damageTypesQuery.data?.[weapon.damage.damage_type] ?? weapon.damage.damage_type;
  const diceTypeLabel = diceTypesQuery.data?.[weapon.damage.dice.dice_type] ?? weapon.damage.dice.dice_type;
  const pieceTypeLabel = weapon.cost
    ? pieceTypesQuery.data?.[weapon.cost.piece_type] ?? weapon.cost.piece_type
    : null;
  const weightUnitLabel = weapon.weight
    ? weightUnitsQuery.data?.[weapon.weight.unit] ?? weapon.weight.unit
    : null;

  const damageText = `${weapon.damage.dice.count}${diceTypeLabel} ${damageTypeLabel}${
    weapon.damage.bonus_damage ? ` +${weapon.damage.bonus_damage}` : ''
  }`;
  const costText = weapon.cost ? `${weapon.cost.count} ${pieceTypeLabel}` : '—';
  const weightText = weapon.weight ? `${weapon.weight.count} ${weightUnitLabel}` : '—';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <BackButton />
          <TitleText style={styles.title}>{weapon.name}</TitleText>
        </View>

        <BodyText style={styles.meta}>Вид оружия: {weaponKindName ?? weapon.weapon_kind_id}</BodyText>
        <BodyText style={styles.meta}>Материал: {materialName ?? weapon.material_id}</BodyText>

        {weapon.description ? (
          <BodyText style={styles.description}>{weapon.description}</BodyText>
        ) : null}

        <View style={styles.infoBlock}>
          <BodyText style={styles.labelText}>Урон</BodyText>
          <BodyText style={styles.helperText}>{damageText}</BodyText>
        </View>

        <View style={styles.infoBlock}>
          <BodyText style={styles.labelText}>Стоимость</BodyText>
          <BodyText style={styles.helperText}>{costText}</BodyText>
        </View>

        <View style={styles.infoBlock}>
          <BodyText style={styles.labelText}>Вес</BodyText>
          <BodyText style={styles.helperText}>{weightText}</BodyText>
        </View>

        <View style={styles.section}>
          <BodyText style={styles.sectionTitle}>Свойства оружия</BodyText>
          {propertyNames.length > 0 ? (
            <View style={styles.chipsContainer}>
              {propertyNames.map((name) => (
                <View key={name} style={styles.chip}>
                  <BodyText style={styles.chipText}>{name}</BodyText>
                </View>
              ))}
            </View>
          ) : (
            <BodyText style={styles.helperText}>Свойства отсутствуют</BodyText>
          )}
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.editButton} onPress={handleEdit}>
            <BodyText style={styles.editButtonText}>Редактировать</BodyText>
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <BodyText style={styles.deleteButtonText}>
              {deleteMutation.isPending ? 'Удаляю…' : 'Удалить'}
            </BodyText>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 12,
  },
  helperText: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
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
  scrollContent: {
    paddingBottom: 24,
    rowGap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  infoBlock: {
    gap: 4,
  },
  labelText: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  section: {
    marginTop: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
});
