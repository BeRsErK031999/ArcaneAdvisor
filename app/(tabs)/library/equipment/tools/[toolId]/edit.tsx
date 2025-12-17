import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { ToolForm } from '@/features/tools/components/ToolForm';
import { getToolById } from '@/features/tools/api/getToolById';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText } from '@/shared/ui/Typography';
import { colors } from '@/shared/theme/colors';
import type { ToolCreateInput } from '@/features/tools/api/types';

export default function ToolEditScreen() {
  const { toolId } = useLocalSearchParams();
  const router = useRouter();
  const resolvedId = String(toolId);

  const {
    data: tool,
    isLoading: isLoadingTool,
    isError: isErrorTool,
    error: errorTool,
    refetch: refetchTool,
  } = useQuery({
    queryKey: ['tools', resolvedId],
    queryFn: () => getToolById(resolvedId),
    enabled: Boolean(resolvedId),
  });

  const isLoadingAll = isLoadingTool;
  const hasError = isErrorTool;

  const handleRetry = () => {
    refetchTool();
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
        <BodyText style={[styles.helperText, styles.errorText]}>
          Не удалось загрузить данные
        </BodyText>
        {isErrorTool && errorTool ? (
          <BodyText style={styles.errorDetails}>{errorTool.message}</BodyText>
        ) : null}
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!tool) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Инструмент не найден.</BodyText>
      </ScreenContainer>
    );
  }

  const initialValues: ToolCreateInput = {
    tool_type: tool.tool_type,
    name: tool.name,
    description: tool.description,
    cost: tool.cost,
    weight: tool.weight,
    utilizes: tool.utilizes,
  };

  return (
    <ToolForm
      mode="edit"
      toolId={resolvedId}
      initialValues={initialValues}
      onSuccess={(id) =>
        router.replace({
          pathname: '/(tabs)/library/equipment/tools/[toolId]',
          params: { toolId: id },
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
