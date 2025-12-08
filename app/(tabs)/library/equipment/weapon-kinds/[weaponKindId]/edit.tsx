import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { getWeaponKindById } from '@/features/weapon-kinds/api/getWeaponKindById';
import type {
  WeaponKind,
  WeaponKindCreateInput,
} from '@/features/weapon-kinds/api/types';
import { WeaponKindForm } from '@/features/weapon-kinds/components/WeaponKindForm';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText } from '@/shared/ui/Typography';

export default function EditWeaponKindScreen() {
  const router = useRouter();
  const { weaponKindId } = useLocalSearchParams<{ weaponKindId?: string }>();

  const {
    data: weaponKind,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WeaponKind, Error>({
    queryKey: ['weapon-kinds', weaponKindId ?? 'unknown-weapon-kind'],
    queryFn: () => getWeaponKindById(String(weaponKindId)),
    enabled: Boolean(weaponKindId),
  });

  if (!weaponKindId) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Не указан идентификатор типа оружия.</BodyText>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={styles.helperText}>Загружаю данные…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError || !weaponKind) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={styles.errorText}>
          Не удалось загрузить тип оружия для редактирования.
        </BodyText>
        <BodyText style={styles.errorDetails}>{error?.message}</BodyText>

        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  const initialValues: WeaponKindCreateInput = {
    weapon_type: weaponKind.weapon_type,
    name: weaponKind.name,
    description: weaponKind.description ?? '',
  };

  return (
    <WeaponKindForm
      mode="edit"
      weaponKindId={String(weaponKindId)}
      initialValues={initialValues}
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={() => router.back()}
      submitLabel="Сохранить изменения"
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
    textAlign: 'center',
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
