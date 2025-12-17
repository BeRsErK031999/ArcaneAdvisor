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

import { deleteMaterialComponent } from '@/features/material-components/api/deleteMaterialComponent';
import { getMaterialComponentById } from '@/features/material-components/api/getMaterialComponentById';
import type { MaterialComponent } from '@/features/material-components/api/types';
import { getMaterials } from '@/features/materials/api/getMaterials';
import type { Material } from '@/features/materials/api/types';
import { colors } from '@/shared/theme/colors';
import { BackButton } from '@/shared/ui/BackButton';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, SubtitleText, TitleText } from '@/shared/ui/Typography';

interface MaterialComponentDetailsProps {
  materialComponentId: string;
}

function formatCost(cost: MaterialComponent['cost']) {
  if (!cost) return '—';
  return `${cost.count} ${cost.piece_type}`;
}

export function MaterialComponentDetails({
  materialComponentId,
}: MaterialComponentDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: component,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MaterialComponent, Error>({
    queryKey: ['material-components', materialComponentId],
    queryFn: () => getMaterialComponentById(materialComponentId),
  });

  const {
    data: materials,
    isError: isMaterialsError,
    isLoading: isLoadingMaterials,
    refetch: refetchMaterials,
    error: materialsError,
  } = useQuery<Material[], Error>({
    queryKey: ['materials'],
    queryFn: getMaterials,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMaterialComponent(materialComponentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-components'] });
      queryClient.removeQueries({ queryKey: ['material-components', materialComponentId] });
      router.back();
    },
  });

  const materialsMap = React.useMemo(() => {
    if (!materials) return {};
    return materials.reduce<Record<string, string>>((acc, material) => {
      acc[material.material_id] = material.name;
      return acc;
    }, {});
  }, [materials]);

  const materialName = component?.material_id
    ? materialsMap[component.material_id] ?? component.material_id
    : null;

  const handleDelete = () => {
    Alert.alert('Удалить компонент', 'Вы уверены, что хотите удалить компонент?', [
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
      pathname: '/(tabs)/library/equipment/material-components/[materialComponentId]/edit',
      params: { materialComponentId },
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю материальный компонент…</BodyText>
        </View>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>
            Не удалось загрузить материальный компонент
          </BodyText>
          <BodyText style={styles.errorDetails}>{error?.message}</BodyText>

          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (!component) {
    return null;
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <BackButton />
          <TitleText style={styles.title}>{component.name}</TitleText>
        </View>

        <View style={styles.card}>
          <SubtitleText style={styles.sectionTitle}>Основная информация</SubtitleText>
          <BodyText style={styles.meta}>
            Материал:{' '}
            {isLoadingMaterials
              ? '—'
              : component.material_id
                ? materialName ?? '—'
                : '—'}
          </BodyText>
          <BodyText style={styles.meta}>Стоимость: {formatCost(component.cost)}</BodyText>
          <BodyText style={styles.meta}>
            Расходуется: {component.consumed ? 'Да' : 'Нет'}
          </BodyText>
        </View>

        {isMaterialsError ? (
          <View style={styles.warningBlock}>
            <BodyText style={styles.warningText}>Справочник материалов не загрузился.</BodyText>
            <BodyText style={styles.warningDetails}>
              {materialsError?.message ?? 'Неизвестная ошибка'}
            </BodyText>
            <Pressable style={styles.retryButtonGhost} onPress={() => refetchMaterials()}>
              <BodyText style={styles.retryButtonText}>Повторить</BodyText>
            </Pressable>
          </View>
        ) : null}

        {component.description ? (
          <View style={styles.card}>
            <SubtitleText style={styles.sectionTitle}>Описание</SubtitleText>
            <BodyText style={styles.description}>{component.description}</BodyText>
          </View>
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
    marginTop: 32,
    alignItems: 'center',
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
  retryButtonGhost: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    rowGap: 8,
  },
  sectionTitle: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
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
  warningBlock: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 12,
    rowGap: 8,
  },
  warningText: {
    color: colors.warning,
    fontWeight: '600',
  },
  warningDetails: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
