import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { deleteWeaponKind } from '@/features/weapon-kinds/api/deleteWeaponKind';
import { getWeaponKindById } from '@/features/weapon-kinds/api/getWeaponKindById';
import { getWeaponTypes } from '@/features/weapon-kinds/api/getWeaponTypes';
import type {
  WeaponKind,
  WeaponTypeOption,
} from '@/features/weapon-kinds/api/types';
import { colors } from '@/shared/theme/colors';
import { BackButton } from '@/shared/ui/BackButton';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';

interface WeaponKindDetailsProps {
  weaponKindId: string;
}

export function WeaponKindDetails({ weaponKindId }: WeaponKindDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: weaponKind,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WeaponKind, Error>({
    queryKey: ['weapon-kinds', weaponKindId],
    queryFn: () => getWeaponKindById(weaponKindId),
  });

  const {
    data: weaponTypes,
    isLoading: isLoadingTypes,
    isError: isErrorTypes,
  } = useQuery<WeaponTypeOption[], Error>({
    queryKey: ['weapon-types'],
    queryFn: getWeaponTypes,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWeaponKind(weaponKindId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapon-kinds'] });
      queryClient.removeQueries({ queryKey: ['weapon-kinds', weaponKindId] });
      router.back();
    },
  });

  const weaponTypeLabel = weaponTypes?.find(
    (type) => type.key === weaponKind?.weapon_type,
  )?.label;
  const weaponTypeDisplay = weaponKind
    ? weaponTypeLabel
      ? `${weaponTypeLabel} (${weaponKind.weapon_type})`
      : weaponKind.weapon_type || '—'
    : '';

  const handleDelete = () => {
    Alert.alert('Удалить тип оружия', 'Вы уверены, что хотите удалить тип оружия?', [
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
      pathname: '/(tabs)/library/equipment/weapon-kinds/[weaponKindId]/edit',
      params: { weaponKindId },
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю тип оружия…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>
          Не удалось загрузить тип оружия
        </BodyText>
        <BodyText style={styles.errorDetails}>
          {error?.message ?? 'Неизвестная ошибка'}
        </BodyText>

        <Pressable
          style={styles.retryButton}
          onPress={() => {
            refetch();
          }}
        >
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!weaponKind) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Тип оружия не найден.</BodyText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <BackButton />
          <TitleText style={styles.title}>{weaponKind.name}</TitleText>
        </View>

        <BodyText style={styles.meta}>
          Тип оружия:{' '}
          {isLoadingTypes ? `${weaponKind.weapon_type || '—'}…` : weaponTypeDisplay}
        </BodyText>

        {isErrorTypes ? (
          <BodyText style={styles.warningText}>Словарь типов не загрузился.</BodyText>
        ) : null}

        {weaponKind.description ? (
          <BodyText style={styles.description}>{weaponKind.description}</BodyText>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable style={styles.secondaryButton} onPress={handleEdit}>
            <BodyText style={styles.secondaryButtonText}>Редактировать</BodyText>
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <BodyText style={styles.deleteButtonText}>Удалить</BodyText>
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
  scrollContent: {
    paddingBottom: 24,
    rowGap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  title: {
    flex: 1,
  },
  meta: {
    color: colors.textMuted,
  },
  warningText: {
    color: colors.warning,
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    columnGap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '700',
  },
});
