import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { ArmorForm } from '@/features/armors/components/ArmorForm';
import { getArmorById } from '@/features/armors/api/getArmorById';
import type { ArmorCreateInput } from '@/features/armors/api/types';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText } from '@/shared/ui/Typography';
import { colors } from '@/shared/theme/colors';

export default function ArmorEditScreen() {
  const { armorId } = useLocalSearchParams();
  const router = useRouter();
  const resolvedId = String(armorId);

  const {
    data: armor,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['armors', resolvedId],
    queryFn: () => getArmorById(resolvedId),
    enabled: Boolean(resolvedId),
  });

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю данные…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>Не удалось загрузить данные</BodyText>
        {error ? <BodyText style={styles.errorDetails}>{error.message}</BodyText> : null}
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!armor) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Доспех не найден.</BodyText>
      </ScreenContainer>
    );
  }

  const initialValues: ArmorCreateInput = {
    armor_type: armor.armor_type,
    name: armor.name,
    description: armor.description ?? '',
    armor_class: {
      base_class: armor.armor_class?.base_class ?? 0,
      modifier: armor.armor_class?.modifier ?? null,
      max_modifier_bonus: armor.armor_class?.max_modifier_bonus ?? null,
    },
    strength: armor.strength ?? 0,
    stealth: armor.stealth ?? false,
    weight: armor.weight,
    cost: armor.cost,
    material_id: armor.material_id,
  };

  return (
    <ArmorForm
      mode="edit"
      armorId={resolvedId}
      initialValues={initialValues}
      onSuccess={(id) =>
        router.replace({
          pathname: '/(tabs)/library/equipment/armors/[armorId]',
          params: { armorId: id },
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
