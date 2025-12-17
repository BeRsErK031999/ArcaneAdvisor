import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { getWeaponPropertyById } from '@/features/weapon-properties/api/getWeaponPropertyById';
import type { WeaponProperty, WeaponPropertyCreateInput } from '@/features/weapon-properties/api/types';
import { WeaponPropertyForm } from '@/features/weapon-properties/components/WeaponPropertyForm';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText } from '@/shared/ui/Typography';

export default function EditWeaponPropertyScreen() {
  const { weaponPropertyId } = useLocalSearchParams<{ weaponPropertyId: string }>();
  const resolvedId = weaponPropertyId ? String(weaponPropertyId) : '';

  const { data, isLoading, isError, error, refetch } = useQuery<WeaponProperty, Error>({
    queryKey: ['weapon-properties', resolvedId],
    queryFn: () => getWeaponPropertyById(resolvedId),
    enabled: Boolean(resolvedId),
  });

  if (!resolvedId) {
    return null;
  }

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю свойство оружия…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>
          Не удалось загрузить свойство оружия
        </BodyText>
        <BodyText style={styles.errorDetails}>{error?.message ?? 'Неизвестная ошибка'}</BodyText>

        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!data) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Свойство оружия не найдено.</BodyText>
      </ScreenContainer>
    );
  }

  const initialValues: WeaponPropertyCreateInput = {
    name: data.name,
    description: data.description ?? '',
    base_range: data.base_range,
    max_range: data.max_range,
    second_hand_dice: data.second_hand_dice,
  };

  return (
    <WeaponPropertyForm
      mode="edit"
      weaponPropertyId={resolvedId}
      initialValues={initialValues}
      showBackButton
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
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
  },
  errorDetails: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.buttonSecondary,
  },
  retryButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '600',
  },
});
