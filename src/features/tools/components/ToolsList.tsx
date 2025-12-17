import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Link, type Href } from 'expo-router';

import { getTools } from '@/features/tools/api/getTools';
import { getToolTypes, type ToolTypeOption } from '@/features/tools/api/getToolTypes';
import type { Tool } from '@/features/tools/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';

function formatWeight(weight: Tool['weight']) {
  if (!weight) return 'Вес: —';
  return `Вес: ${weight.count} ${weight.unit}`;
}

function formatCost(cost: Tool['cost']) {
  if (!cost) return 'Стоимость: —';
  return `Стоимость: ${cost.count} ${cost.piece_type}`;
}

export function ToolsList() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<
    Tool[],
    Error
  >({
    queryKey: ['tools'],
    queryFn: getTools,
  });

  const { data: toolTypes } = useQuery<ToolTypeOption[]>({
    queryKey: ['tool-types'],
    queryFn: getToolTypes,
  });

  const toolTypeLabels = React.useMemo(() => {
    if (!toolTypes) return new Map<string, string>();
    return new Map(toolTypes.map((item) => [item.key, item.label]));
  }, [toolTypes]);

  const tools = data ?? [];
  const showList = !isLoading && !isError && tools.length > 0;
  const showEmpty = !isLoading && !isError && tools.length === 0;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <TitleText>Инструменты</TitleText>

        <Link href="/(tabs)/library/equipment/tools/create" asChild>
          <Pressable style={styles.createButton}>
            <BodyText style={styles.createButtonText}>+ Создать</BodyText>
          </Pressable>
        </Link>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю инструменты…</BodyText>
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <BodyText style={[styles.helperText, styles.errorText]}>
            Ошибка при загрузке инструментов
          </BodyText>
          <BodyText style={styles.errorDetails}>
            {error?.message ?? 'Неизвестная ошибка'}
          </BodyText>

          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      )}

      {showEmpty && (
        <View style={styles.centered}>
          <BodyText style={styles.helperText}>Инструментов пока нет</BodyText>

          <Link href="/(tabs)/library/equipment/tools/create" asChild>
            <Pressable style={styles.createButtonWide}>
              <BodyText style={styles.createButtonText}>+ Создать инструмент</BodyText>
            </Pressable>
          </Link>
        </View>
      )}

      {showList && (
        <FlatList
          data={tools}
          keyExtractor={(item) => item.tool_id}
          renderItem={({ item }) => (
            <ToolListItem
              tool={item}
              typeLabel={toolTypeLabels.get(item.tool_type) ?? item.tool_type}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      )}
    </ScreenContainer>
  );
}

type ToolListItemProps = {
  tool: Tool;
  typeLabel: string;
};

function ToolListItem({ tool, typeLabel }: ToolListItemProps) {
  const href = {
    pathname: '/(tabs)/library/equipment/tools/[toolId]',
    params: { toolId: String(tool.tool_id) },
  } satisfies Href;

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.cardHeader}>
          <BodyText style={styles.name}>{tool.name}</BodyText>
          <BodyText style={styles.type}>{typeLabel}</BodyText>
        </View>
        <BodyText style={styles.meta}>{formatWeight(tool.weight)}</BodyText>
        <BodyText style={styles.meta}>{formatCost(tool.cost)}</BodyText>
        {tool.description ? (
          <BodyText style={styles.description} numberOfLines={2}>
            {tool.description}
          </BodyText>
        ) : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
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
  listContainer: {
    paddingBottom: 24,
    rowGap: 12,
  },
  separator: {
    height: 12,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  createButtonWide: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  createButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  cardPressed: {
    backgroundColor: colors.surfaceElevated ?? colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    color: colors.textPrimary,
  },
  type: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 4,
  },
});
