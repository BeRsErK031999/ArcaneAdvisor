import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { WeaponForm } from '@/features/weapons/components/WeaponForm';
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

export default function WeaponCreateScreen() {
  const router = useRouter();

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

  const isLoadingDictionaries =
    weaponKindsQuery.isLoading ||
    weaponPropertiesQuery.isLoading ||
    materialsQuery.isLoading ||
    pieceTypesQuery.isLoading ||
    diceTypesQuery.isLoading ||
    damageTypesQuery.isLoading ||
    weightUnitsQuery.isLoading;

  const hasError =
    weaponKindsQuery.isError ||
    weaponPropertiesQuery.isError ||
    materialsQuery.isError ||
    pieceTypesQuery.isError ||
    diceTypesQuery.isError ||
    damageTypesQuery.isError ||
    weightUnitsQuery.isError;

  if (isLoadingDictionaries) {
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
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            weaponKindsQuery.refetch();
            weaponPropertiesQuery.refetch();
            materialsQuery.refetch();
            pieceTypesQuery.refetch();
            diceTypesQuery.refetch();
            damageTypesQuery.refetch();
            weightUnitsQuery.refetch();
          }}
        >
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <WeaponForm
      mode="create"
      showBackButton
      onSuccess={() => router.replace('/(tabs)/library/equipment/weapons')}
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
