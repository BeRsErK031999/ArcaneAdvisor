import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { getSubclassById } from '@/features/subclasses/api/getSubclassById';
import type { Subclass } from '@/features/subclasses/api/types';
import { colors } from '@/shared/theme/colors';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BackButton } from '@/shared/ui/BackButton';
import { BodyText, TitleText } from '@/shared/ui/Typography';

interface SubclassDetailsProps {
  subclassId: string;
}

export function SubclassDetails({ subclassId }: SubclassDetailsProps) {
  const router = useRouter();
  const { data: subclass, isLoading, isError, error, refetch } = useQuery<Subclass, Error>({
    queryKey: ['subclasses', subclassId],
    queryFn: () => getSubclassById(subclassId),
  });

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
        <BodyText style={styles.helperText}>Загружаю подкласс…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError || !subclass) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={[styles.helperText, styles.errorText]}>
          Не удалось загрузить подкласс
        </BodyText>
        <BodyText style={styles.errorDetails}>{error?.message ?? 'Неизвестная ошибка'}</BodyText>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <BodyText style={styles.retryText}>Повторить</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <BackButton />
          <TitleText style={styles.title}>{subclass.name}</TitleText>
        </View>

        {subclass.name_in_english ? (
          <BodyText style={styles.subtitle}>{subclass.name_in_english}</BodyText>
        ) : null}

        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/library/subclasses/[subclassId]/edit',
              params: { subclassId: subclass.subclass_id },
            })
          }
        >
          <BodyText style={styles.editButtonText}>Редактировать</BodyText>
        </Pressable>

        <View style={styles.block}>
          <BodyText style={styles.blockTitle}>Информация</BodyText>
          <BodyText>
            <BodyText style={styles.label}>ID класса: </BodyText>
            {subclass.class_id}
          </BodyText>
        </View>

        <View style={styles.block}>
          <BodyText style={styles.blockTitle}>Описание</BodyText>
          <BodyText>{subclass.description}</BodyText>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    rowGap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  title: {
    flex: 1,
    marginBottom: 0,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  block: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    rowGap: 6,
  },
  blockTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  label: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  editButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  editButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 8,
    padding: 24,
  },
  helperText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontWeight: '700',
  },
  errorDetails: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  retryText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
});
