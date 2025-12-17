import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteWeapon } from '@/features/weapons/api/deleteWeapon';
import { getWeaponById } from '@/features/weapons/api/getWeaponById';
import type { Weapon } from '@/features/weapons/api/types';
import { getWeaponKinds } from '@/features/weapon-kinds/api/getWeaponKinds';
import type { WeaponKind } from '@/features/weapon-kinds/api/types';
import { getWeaponProperties } from '@/features/weapon-properties/api/getWeaponProperties';
import type { WeaponProperty } from '@/features/weapon-properties/api/types';
import { getWeaponPropertyNames } from '@/features/weapon-properties/api/getWeaponPropertyNames';
import { getMaterials } from '@/features/materials/api/getMaterials';
import { getDamageTypes } from '@/features/dictionaries/api/getDamageTypes';
import { getDiceTypes } from '@/features/dictionaries/api/getDiceTypes';
import { getPieceTypes } from '@/features/dictionaries/api/getPieceTypes';
import { getWeightUnits } from '@/features/dictionaries/api/getWeightUnits';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BackButton } from '@/shared/ui/BackButton';
import { BodyText, TitleText } from '@/shared/ui/Typography';

interface WeaponDetailsProps {
  weaponId?: string;
}

function formatDamage(damage: Weapon['damage'], diceTypes?: Record<string, string>, damageTypes?: Record<string, string>) {
  const diceTypeRaw = diceTypes?.[damage.dice.dice_type] ?? damage.dice.dice_type;
  const damageTypeLabel = damageTypes?.[damage.damage_type] ?? damage.damage_type;
  const dicePart = diceTypeRaw.startsWith('d')
    ? `${damage.dice.count}${diceTypeRaw}`
    : `${damage.dice.count}d${diceTypeRaw}`;

  const base = `${dicePart} ${damageTypeLabel}`;
  return damage.bonus_damage ? `${base} +${damage.bonus_damage}` : base;
}

export function WeaponDetails({ weaponId }: WeaponDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const hasWeaponId = Boolean(weaponId);

  const weaponQuery = useQuery<Weapon, Error>({
    queryKey: ['weapons', weaponId],
    queryFn: () => getWeaponById(String(weaponId)),
    enabled: hasWeaponId,
  });

  const weaponKindsQuery = useQuery<WeaponKind[], Error>({
    queryKey: ['weapon-kinds'],
    queryFn: () => getWeaponKinds(),
  });
  const materialsQuery = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const weaponPropertiesQuery = useQuery<WeaponProperty[], Error>({
    queryKey: ['weapon-properties'],
    queryFn: () => getWeaponProperties(),
  });
  const weaponPropertyNamesQuery = useQuery({
    queryKey: ['weapon-property-names'],
    queryFn: getWeaponPropertyNames,
  });
  const damageTypesQuery = useQuery({ queryKey: ['damage-types'], queryFn: getDamageTypes });
  const diceTypesQuery = useQuery({ queryKey: ['dice-types'], queryFn: getDiceTypes });
  const pieceTypesQuery = useQuery({ queryKey: ['piece-types'], queryFn: getPieceTypes });
  const weightUnitsQuery = useQuery({ queryKey: ['weight-units'], queryFn: getWeightUnits });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWeapon(String(weaponId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapons'] });
      queryClient.removeQueries({ queryKey: ['weapons', weaponId] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert('Удалить оружие', 'Вы уверены, что хотите удалить оружие?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const handleEdit = () => {
    router.push({
      pathname: '/(tabs)/library/equipment/weapons/[weaponId]/edit',
      params: { weaponId: String(weaponId) },
    });
  };

  if (!hasWeaponId) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Не указан идентификатор оружия.</BodyText>
      </ScreenContainer>
    );
  }

  if (weaponQuery.isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю оружие…</BodyText>
      </ScreenContainer>
    );
  }

  if (weaponQuery.isError) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>Не удалось загрузить оружие</BodyText>
        {weaponQuery.error ? (
          <BodyText style={styles.errorDetails}>{weaponQuery.error.message}</BodyText>
        ) : null}

        <Pressable style={styles.retryButton} onPress={() => weaponQuery.refetch()}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  const weapon = weaponQuery.data;

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

  const weaponPropertiesMap = React.useMemo(() => {
    if (!weaponPropertiesQuery.data) return new Map<string, WeaponProperty>();
    return new Map(
      weaponPropertiesQuery.data.map((property) => [property.weapon_property_id, property]),
    );
  }, [weaponPropertiesQuery.data]);

  const weaponPropertyNameMap = React.useMemo(() => {
    if (!weaponPropertyNamesQuery.data) return new Map<string, string>();
    return new Map(
      weaponPropertyNamesQuery.data.map(({ key, label }) => [key, label || key]),
    );
  }, [weaponPropertyNamesQuery.data]);

  const propertiesList = weapon.weapon_property_ids
    .map((id) => {
      const property = weaponPropertiesMap.get(id);
      if (!property) return { id, label: id };

      const readableLabel = weaponPropertyNameMap.get(property.name) ?? property.name;
      return {
        id,
        label: readableLabel,
        technicalName: property.name,
      };
    })
    .filter(Boolean);

  const costText = weapon.cost
    ? `${weapon.cost.count} ${
        pieceTypesQuery.data?.[weapon.cost.piece_type] ?? weapon.cost.piece_type
      }`
    : '—';
  const weightText = weapon.weight
    ? `${weapon.weight.count} ${weightUnitsQuery.data?.[weapon.weight.unit] ?? weapon.weight.unit}`
    : '—';
  const damageText = formatDamage(weapon.damage, diceTypesQuery.data, damageTypesQuery.data);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <BackButton />
          <TitleText style={styles.title}>{weapon.name}</TitleText>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <BodyText style={styles.labelText}>Вид оружия</BodyText>
            <BodyText style={styles.helperText}>{weaponKindName ?? weapon.weapon_kind_id}</BodyText>
          </View>

          <View style={styles.infoBlock}>
            <BodyText style={styles.labelText}>Материал</BodyText>
            <BodyText style={styles.helperText}>{materialName ?? weapon.material_id}</BodyText>
          </View>
        </View>

        {weapon.description ? (
          <BodyText style={styles.description}>{weapon.description}</BodyText>
        ) : null}

        <View style={styles.infoBlock}>
          <BodyText style={styles.labelText}>Урон</BodyText>
          <BodyText style={styles.helperText}>{damageText}</BodyText>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <BodyText style={styles.labelText}>Стоимость</BodyText>
            <BodyText style={styles.helperText}>{costText}</BodyText>
          </View>

          <View style={styles.infoBlock}>
            <BodyText style={styles.labelText}>Вес</BodyText>
            <BodyText style={styles.helperText}>{weightText}</BodyText>
          </View>
        </View>

        <View style={styles.section}>
          <BodyText style={styles.sectionTitle}>Свойства оружия</BodyText>
          {propertiesList.length > 0 ? (
            <View style={styles.chipsContainer}>
              {propertiesList.map((property) => (
                <View key={property.id} style={styles.chip}>
                  <BodyText style={styles.chipTitle}>{property.label}</BodyText>
                  {property.technicalName && property.technicalName !== property.label ? (
                    <BodyText style={styles.chipSubtitle}>{property.technicalName}</BodyText>
                  ) : null}
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
  description: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBlock: {
    flex: 1,
    gap: 4,
  },
  labelText: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  section: {
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
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
  },
  chipTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
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
