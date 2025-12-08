import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteTool } from '@/features/tools/api/deleteTool';
import { getToolById } from '@/features/tools/api/getToolById';
import type { Tool } from '@/features/tools/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';
import { BackButton } from '@/shared/ui/BackButton';

interface ToolDetailsProps {
  toolId?: string;
}

export function ToolDetails({ toolId }: ToolDetailsProps) {
  const params = useLocalSearchParams();
  const resolvedToolId = toolId ?? String(params.toolId ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: tool,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Tool, Error>({
    queryKey: ['tools', resolvedToolId],
    queryFn: () => getToolById(resolvedToolId),
    enabled: Boolean(resolvedToolId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTool(resolvedToolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert('Удалить инструмент', 'Вы уверены, что хотите удалить инструмент?', [
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
      pathname: '/(tabs)/library/equipment/tools/[toolId]/edit',
      params: { toolId: resolvedToolId },
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю инструмент…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError) {
    console.error('Failed to load tool:', error);
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>
          Ошибка при загрузке инструмента
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

  if (!tool) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Инструмент не найден.</BodyText>
      </ScreenContainer>
    );
  }

  const renderUtilizes = () => {
    if (!tool.utilizes || tool.utilizes.length === 0) {
      return <BodyText style={styles.helperText}>Нет связанных действий</BodyText>;
    }

    return tool.utilizes.map((utilize, index) => (
      <View key={`${utilize.action}-${index}`} style={styles.utilizeItem}>
        <BodyText style={styles.labelText}>{utilize.action}</BodyText>
        <BodyText style={styles.helperText}>Сложность: {utilize.complexity}</BodyText>
      </View>
    ));
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <BackButton />
          <TitleText style={styles.title}>{tool.name}</TitleText>
        </View>

        <BodyText style={styles.meta}>Тип: {tool.tool_type}</BodyText>
        <BodyText style={styles.meta}>
          Стоимость: {tool.cost.count} {tool.cost.piece_type}
        </BodyText>
        <BodyText style={styles.meta}>
          Вес: {tool.weight.count} {tool.weight.unit}
        </BodyText>

        {tool.description ? (
          <BodyText style={styles.description}>{tool.description}</BodyText>
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

        <View style={styles.section}>
          <BodyText style={styles.sectionTitle}>Действия</BodyText>
          {renderUtilizes()}
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
  section: {
    marginTop: 12,
    rowGap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  labelText: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  utilizeItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
});
