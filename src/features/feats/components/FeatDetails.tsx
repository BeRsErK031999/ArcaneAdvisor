import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getFeatById } from '@/features/feats/api/getFeatById';
import { deleteFeat } from '@/features/feats/api/deleteFeat';
import type { Feat } from '@/features/feats/api/types';
import { getModifiers } from '@/features/dictionaries/api/getModifiers';
import type { Modifiers } from '@/features/dictionaries/api/types';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';
import { colors } from '@/shared/theme/colors';
import { BackButton } from '@/shared/ui/BackButton';

interface FeatDetailsProps {
  featId: string;
}

export function FeatDetails({ featId }: FeatDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: feat,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Feat, Error>({
    queryKey: ['feats', featId],
    queryFn: () => getFeatById(featId),
  });

  const { data: modifiers } = useQuery<Modifiers>({
    queryKey: ['modifiers'],
    queryFn: getModifiers,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFeat(featId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feats'] });
      queryClient.removeQueries({ queryKey: ['feats', featId] });
      router.back();
    },
  });

  const modifiersMap = React.useMemo(() => new Map(Object.entries(modifiers ?? {})), [modifiers]);

  const formatArmorTypes = (armorTypes: string[]) => {
    if (!armorTypes.length) return '—';
    return armorTypes.map((item) => item || '—').join(', ');
  };

  const formatRequiredModifiers = (requiredModifiers: Feat['required_modifiers']) => {
    if (!requiredModifiers.length) return '—';
    return requiredModifiers
      .map((modifier) => {
        const label = modifiersMap.get(modifier.modifier) ?? modifier.modifier.toUpperCase();
        return `${label} ≥ ${modifier.min_value}`;
      })
      .join(', ');
  };

  const formatIncreaseModifiers = (increase: string[]) => {
    if (!increase.length) return '—';
    return increase
      .map((modifier) => modifiersMap.get(modifier) ?? modifier.toUpperCase())
      .join(', ');
  };

  const handleDelete = () => {
    Alert.alert('Удалить способность?', 'Действие нельзя отменить.', [
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
        <BodyText style={styles.helperText}>Загружаю способность…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError) {
    console.error('Failed to load feat:', error);
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>
          Ошибка при загрузке способности
        </BodyText>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!feat) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Способность не найдена.</BodyText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <BackButton />
        <TitleText style={styles.title}>{feat.name}</TitleText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <BodyText style={styles.label}>Описание</BodyText>
            <BodyText style={styles.value}>{feat.description}</BodyText>
          </View>

          <View style={styles.cardRow}>
            <BodyText style={styles.label}>Кастер</BodyText>
            <BodyText style={styles.value}>{feat.caster ? 'Да' : 'Нет'}</BodyText>
          </View>

          <View style={styles.cardRow}>
            <BodyText style={styles.label}>Требуемые типы брони</BodyText>
            <BodyText style={styles.value}>{formatArmorTypes(feat.required_armor_types)}</BodyText>
          </View>

          <View style={styles.cardRow}>
            <BodyText style={styles.label}>Требуемые характеристики</BodyText>
            <BodyText style={styles.value}>{formatRequiredModifiers(feat.required_modifiers)}</BodyText>
          </View>

          <View style={styles.cardRow}>
            <BodyText style={styles.label}>Увеличиваемые характеристики</BodyText>
            <BodyText style={styles.value}>{formatIncreaseModifiers(feat.increase_modifiers)}</BodyText>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/library/feats/[featId]/edit',
                params: { featId },
              })
            }
          >
            <Text style={styles.primaryButtonText}>Редактировать</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.dangerButton]}
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Text style={styles.dangerButtonText}>
              {deleteMutation.isPending ? 'Удаляю…' : 'Удалить'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    rowGap: 12,
  },
  helperText: {
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    marginBottom: 0,
  },
  content: {
    rowGap: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 16,
    rowGap: 12,
  },
  cardRow: {
    rowGap: 4,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  value: {
    color: colors.textPrimary,
  },
  actions: {
    rowGap: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.buttonPrimary,
  },
  primaryButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  dangerButtonText: {
    color: colors.surface,
    fontWeight: '700',
  },
});
