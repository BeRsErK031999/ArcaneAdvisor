import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { ToolForm } from '@/features/tools/components/ToolForm';
import { getToolTypes } from '@/features/tools/api/getToolTypes';
import { getPieceTypes } from '@/features/dictionaries/api/getPieceTypes';
import { getWeightUnits } from '@/features/dictionaries/api/getWeightUnits';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText } from '@/shared/ui/Typography';
import { colors } from '@/shared/theme/colors';

export default function ToolCreateScreen() {
  const router = useRouter();

  const {
    isLoading: isLoadingToolTypes,
    isError: isErrorToolTypes,
    refetch: refetchToolTypes,
  } = useQuery({
    queryKey: ['tool-types'],
    queryFn: getToolTypes,
  });

  const {
    isLoading: isLoadingPieceTypes,
    isError: isErrorPieceTypes,
    refetch: refetchPieceTypes,
  } = useQuery({
    queryKey: ['piece-types'],
    queryFn: getPieceTypes,
  });

  const {
    isLoading: isLoadingWeightUnits,
    isError: isErrorWeightUnits,
    refetch: refetchWeightUnits,
  } = useQuery({
    queryKey: ['weight-units'],
    queryFn: getWeightUnits,
  });

  const isLoadingDictionaries =
    isLoadingToolTypes || isLoadingPieceTypes || isLoadingWeightUnits;
  const hasDictionaryError = isErrorToolTypes || isErrorPieceTypes || isErrorWeightUnits;

  if (isLoadingDictionaries) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю данные…</BodyText>
      </ScreenContainer>
    );
  }

  if (hasDictionaryError) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>
          Не удалось загрузить данные
        </BodyText>
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            refetchToolTypes();
            refetchPieceTypes();
            refetchWeightUnits();
          }}
        >
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ToolForm
      mode="create"
      onSuccess={() => router.replace('/(tabs)/library/equipment/tools')}
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
