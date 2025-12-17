import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteArmor } from '@/features/armors/api/deleteArmor';
import { getArmorById } from '@/features/armors/api/getArmorById';
import type { Armor } from '@/features/armors/api/types';
import { getMaterials } from '@/features/materials/api/getMaterials';
import type { Material } from '@/features/materials/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';
import { BackButton } from '@/shared/ui/BackButton';
import { getArmorTypes, type ArmorTypeOption } from '@/features/armors/api/getArmorTypes';

interface ArmorDetailsProps {
  armorId?: string;
}

export function ArmorDetails({ armorId }: ArmorDetailsProps) {
  const params = useLocalSearchParams();
  const resolvedArmorId = armorId ?? String(params.armorId ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: armor, isLoading, isError, error, refetch } = useQuery<Armor, Error>({
    queryKey: ['armors', resolvedArmorId],
    queryFn: () => getArmorById(resolvedArmorId),
    enabled: Boolean(resolvedArmorId),
  });

  const { data: materials } = useQuery<Material[]>({
    queryKey: ['materials'],
    queryFn: getMaterials,
  });

  const { data: armorTypes } = useQuery<ArmorTypeOption[]>({
    queryKey: ['armor-types'],
    queryFn: getArmorTypes,
  });

  const materialMap = React.useMemo(() => {
    if (!materials) return new Map<string, string>();
    return new Map(materials.map((item) => [item.material_id, item.name]));
  }, [materials]);

  const armorTypeLabels = React.useMemo(() => {
    if (!armorTypes) return new Map<string, string>();
    return new Map(armorTypes.map((item) => [item.key, item.label]));
  }, [armorTypes]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteArmor(resolvedArmorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armors'] });
      queryClient.removeQueries({ queryKey: ['armors', resolvedArmorId] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert('Удалить доспех', 'Вы уверены, что хотите удалить доспех?', [
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
      pathname: '/(tabs)/library/equipment/armors/[armorId]/edit',
      params: { armorId: resolvedArmorId },
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю доспех…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError) {
    console.error('Failed to load armor:', error);
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>Ошибка при загрузке доспеха</BodyText>
        <BodyText style={styles.errorDetails}>{error?.message ?? 'Неизвестная ошибка'}</BodyText>

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

  const materialName = armor.material_id ? materialMap.get(armor.material_id) : undefined;
  const armorTypeLabel = armorTypeLabels.get(armor.armor_type) ?? armor.armor_type;

  const formattedCost = armor.cost ? `${armor.cost.count} ${armor.cost.piece_type}` : '—';
  const formattedWeight = armor.weight ? `${armor.weight.count} ${armor.weight.unit}` : '—';
  const formattedModifier = armor.armor_class.modifier ?? '—';
  const formattedMaxBonus = armor.armor_class.max_modifier_bonus ?? '—';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <BackButton />
          <TitleText style={styles.title}>{armor.name}</TitleText>
        </View>

        <BodyText style={styles.meta}>Тип: {armorTypeLabel}</BodyText>
        <BodyText style={styles.meta}>Материал: {materialName ?? '—'}</BodyText>
        <BodyText style={styles.meta}>Базовый AC: {armor.armor_class.base_class}</BodyText>
        <BodyText style={styles.meta}>Модификатор: {formattedModifier}</BodyText>
        <BodyText style={styles.meta}>Макс. бонус модификатора: {formattedMaxBonus}</BodyText>
        <BodyText style={styles.meta}>Требование силы: {armor.strength}</BodyText>
        <BodyText style={styles.meta}>
          Помеха к скрытности: {armor.stealth ? 'да' : 'нет'}
        </BodyText>
        <BodyText style={styles.meta}>Вес: {formattedWeight}</BodyText>
        <BodyText style={styles.meta}>Стоимость: {formattedCost}</BodyText>

        {armor.description ? (
          <BodyText style={styles.description}>{armor.description}</BodyText>
        ) : null}

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
    columnGap: 8,
  },
  title: {
    flex: 1,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    columnGap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
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
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
});
