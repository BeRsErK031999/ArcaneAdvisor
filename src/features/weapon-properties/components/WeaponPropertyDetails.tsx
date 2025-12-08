import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { deleteWeaponProperty } from '@/features/weapon-properties/api/deleteWeaponProperty';
import { getWeaponPropertyById } from '@/features/weapon-properties/api/getWeaponPropertyById';
import { getWeaponPropertyNames } from '@/features/weapon-properties/api/getWeaponPropertyNames';
import type {
  WeaponProperty,
  WeaponPropertyNameOption,
} from '@/features/weapon-properties/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';

interface WeaponPropertyDetailsProps {
  weaponPropertyId: string;
}

export function WeaponPropertyDetails({ weaponPropertyId }: WeaponPropertyDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WeaponProperty, Error>({
    queryKey: ['weapon-properties', weaponPropertyId],
    queryFn: () => getWeaponPropertyById(weaponPropertyId),
  });

  const { data: propertyNames } = useQuery<WeaponPropertyNameOption[], Error>({
    queryKey: ['weapon-property-names'],
    queryFn: getWeaponPropertyNames,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWeaponProperty(weaponPropertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapon-properties'] });
      router.back();
    },
  });

  const readableName = React.useMemo(() => {
    if (!data) return null;
    return propertyNames?.find((option) => option.key === data.name)?.label;
  }, [data, propertyNames]);

  const handleEdit = () => {
    router.push({
      pathname: '/(tabs)/library/equipment/weapon-properties/[weaponPropertyId]/edit',
      params: { weaponPropertyId },
    });
  };

  const handleDelete = () => {
    Alert.alert('Удалить свойство', 'Вы уверены, что хотите удалить свойство оружия?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

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
        <BodyText style={styles.errorDetails}>
          {error?.message ?? 'Неизвестная ошибка'}
        </BodyText>

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

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <TitleText style={styles.title}>{readableName ?? data.name}</TitleText>
      </View>

      <View style={styles.infoBlock}>
        <BodyText style={styles.label}>Ключ свойства</BodyText>
        <BodyText style={styles.value}>{data.name}</BodyText>
      </View>

      {readableName ? (
        <View style={styles.infoBlock}>
          <BodyText style={styles.label}>Название</BodyText>
          <BodyText style={styles.value}>{readableName}</BodyText>
        </View>
      ) : null}

      <View style={styles.infoBlock}>
        <BodyText style={styles.label}>Описание</BodyText>
        <BodyText style={styles.description}>{data.description}</BodyText>
      </View>

      <View style={styles.infoBlock}>
        <BodyText style={styles.label}>Базовая дистанция</BodyText>
        <BodyText style={styles.value}>
          {data.base_range
            ? `${data.base_range.range.count} ${data.base_range.range.unit}`
            : '—'}
        </BodyText>
      </View>

      <View style={styles.infoBlock}>
        <BodyText style={styles.label}>Максимальная дистанция</BodyText>
        <BodyText style={styles.value}>
          {data.max_range ? `${data.max_range.range.count} ${data.max_range.range.unit}` : '—'}
        </BodyText>
      </View>

      <View style={styles.infoBlock}>
        <BodyText style={styles.label}>Кости второй руки</BodyText>
        <BodyText style={styles.value}>
          {data.second_hand_dice
            ? `${data.second_hand_dice.dice.count} ${data.second_hand_dice.dice.dice_type}`
            : '—'}
        </BodyText>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.secondaryButton} onPress={handleEdit}>
          <BodyText style={styles.secondaryButtonText}>Редактировать</BodyText>
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
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
  },
  errorDetails: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.buttonSecondary,
  },
  retryButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '600',
  },
  headerRow: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 0,
  },
  infoBlock: {
    marginBottom: 12,
    rowGap: 4,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  description: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
  },
  actionsRow: {
    marginTop: 20,
    flexDirection: 'row',
    columnGap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
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
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '700',
  },
});
