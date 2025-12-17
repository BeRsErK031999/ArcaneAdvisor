import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { WeaponForm } from '@/features/weapons/components/WeaponForm';
import { getWeaponById } from '@/features/weapons/api/getWeaponById';
import type { WeaponCreateInput } from '@/features/weapons/api/types';
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

  const isLoadingAll = weaponQuery.isLoading;

  const hasError = weaponQuery.isError;

  const handleRetry = () => {
    weaponQuery.refetch();
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
      onSuccess={() =>
        router.replace({
          pathname: '/(tabs)/library/equipment/weapons/[weaponId]',
          params: { weaponId: resolvedId },
        })
      }
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
