import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { getMaterialComponentById } from '@/features/material-components/api/getMaterialComponentById';
import type {
  MaterialComponent,
  MaterialComponentCreateInput,
} from '@/features/material-components/api/types';
import { MaterialComponentForm } from '@/features/material-components/components/MaterialComponentForm';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText } from '@/shared/ui/Typography';

export default function EditMaterialComponentScreen() {
  const router = useRouter();
  const { materialComponentId } = useLocalSearchParams<{ materialComponentId?: string }>();
  const resolvedId = materialComponentId ? String(materialComponentId) : '';

  const { data, isLoading, isError, error, refetch } = useQuery<MaterialComponent, Error>({
    queryKey: ['material-components', resolvedId],
    queryFn: () => getMaterialComponentById(resolvedId),
    enabled: Boolean(resolvedId),
  });

  if (!resolvedId) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Не указан идентификатор компонента.</BodyText>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю данные…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={styles.errorText}>Не удалось загрузить компонент.</BodyText>
        <BodyText style={styles.errorDetails}>{error?.message}</BodyText>

        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  const initialValues: MaterialComponentCreateInput = {
    name: data.name,
    description: data.description ?? '',
    material_id: data.material_id,
    cost: data.cost,
    consumed: data.consumed,
  };

  return (
    <MaterialComponentForm
      mode="edit"
      materialComponentId={resolvedId}
      initialValues={initialValues}
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={(id) =>
        router.replace({
          pathname: '/(tabs)/library/equipment/material-components/[materialComponentId]',
          params: { materialComponentId: String(id) },
        })
      }
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
