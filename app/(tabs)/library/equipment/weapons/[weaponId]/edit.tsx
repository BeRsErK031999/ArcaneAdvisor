import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { WeaponForm } from '@/features/weapons/components/WeaponForm';
import { getWeaponById } from '@/features/weapons/api/getWeaponById';
import type { WeaponCreateInput } from '@/features/weapons/api/types';
import { getWeaponKinds } from '@/features/weapon-kinds/api/getWeaponKinds';
import { getWeaponProperties } from '@/features/weapon-properties/api/getWeaponProperties';
import { getMaterials } from '@/features/materials/api/getMaterials';
import { getPieceTypes } from '@/features/dictionaries/api/getPieceTypes';
import { getDiceTypes } from '@/features/dictionaries/api/getDiceTypes';
import { getDamageTypes } from '@/features/dictionaries/api/getDamageTypes';
import { getWeightUnits } from '@/features/dictionaries/api/getWeightUnits';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText } from '@/shared/ui/Typography';
import { colors } from '@/shared/theme/colors';

export default function WeaponEditScreen() {
  const { weaponId } = useLocalSearchParams();
  const router = useRouter();
  const resolvedId = String(weaponId);

  const weaponQuery = useQuery({
    queryKey: ['weapons', resolvedId],
    queryFn: () => getWeaponById(resolvedId),
    enabled: Boolean(resolvedId),
  });

  const weaponKindsQuery = useQuery({ queryKey: ['weapon-kinds'], queryFn: getWeaponKinds });
  const weaponPropertiesQuery = useQuery({
    queryKey: ['weapon-properties'],
    queryFn: getWeaponProperties,
  });
  const materialsQuery = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const pieceTypesQuery = useQuery({ queryKey: ['piece-types'], queryFn: getPieceTypes });
  const diceTypesQuery = useQuery({ queryKey: ['dice-types'], queryFn: getDiceTypes });
  const damageTypesQuery = useQuery({ queryKey: ['damage-types'], queryFn: getDamageTypes });
  const weightUnitsQuery = useQuery({ queryKey: ['weight-units'], queryFn: getWeightUnits });

  const isLoadingAll =
    weaponQuery.isLoading ||
    weaponKindsQuery.isLoading ||
    weaponPropertiesQuery.isLoading ||
    materialsQuery.isLoading ||
    pieceTypesQuery.isLoading ||
    diceTypesQuery.isLoading ||
    damageTypesQuery.isLoading ||
    weightUnitsQuery.isLoading;

  const hasError =
    weaponQuery.isError ||
    weaponKindsQuery.isError ||
    weaponPropertiesQuery.isError ||
    materialsQuery.isError ||
    pieceTypesQuery.isError ||
    diceTypesQuery.isError ||
    damageTypesQuery.isError ||
    weightUnitsQuery.isError;

  const handleRetry = () => {
    weaponQuery.refetch();
    weaponKindsQuery.refetch();
    weaponPropertiesQuery.refetch();
    materialsQuery.refetch();
    pieceTypesQuery.refetch();
    diceTypesQuery.refetch();
    damageTypesQuery.refetch();
    weightUnitsQuery.refetch();
  };

  if (isLoadingAll) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю данные…</BodyText>
      </ScreenContainer>
    );
  }

  if (hasError) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>Не удалось загрузить данные</BodyText>
        {weaponQuery.error ? (
          <BodyText style={styles.errorDetails}>{weaponQuery.error.message}</BodyText>
        ) : null}
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!weaponQuery.data) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Оружие не найдено.</BodyText>
      </ScreenContainer>
    );
  }

  const initialValues: WeaponCreateInput = {
    weapon_kind_id: weaponQuery.data.weapon_kind_id,
    name: weaponQuery.data.name,
    description: weaponQuery.data.description,
    cost: weaponQuery.data.cost,
    damage: weaponQuery.data.damage,
    weight: weaponQuery.data.weight,
    weapon_property_ids: weaponQuery.data.weapon_property_ids,
    material_id: weaponQuery.data.material_id,
  };

  return (
    <WeaponForm
      mode="edit"
      weaponId={resolvedId}
      showBackButton
      initialValues={initialValues}
      onSuccess={() => router.back()}
    />
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
});
