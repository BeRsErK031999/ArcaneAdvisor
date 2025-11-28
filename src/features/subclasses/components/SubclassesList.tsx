import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { getSubclasses } from '@/features/subclasses/api/getSubclasses';
import type { Subclass } from '@/features/subclasses/api/types';
import { colors } from '@/shared/theme/colors';
import { BackButton } from '@/shared/ui/BackButton';
import { ScreenContainer } from '@/shared/ui/ScreenContainer';
import { BodyText, TitleText } from '@/shared/ui/Typography';

export function SubclassesList() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['subclasses'],
    queryFn: getSubclasses,
  });

  const handleCreate = () => router.push('/(tabs)/library/subclasses/create');

  const renderItem = ({ item }: { item: Subclass }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/(tabs)/library/subclasses/[subclassId]',
          params: { subclassId: item.subclass_id },
        })
      }
      style={styles.card}
    >
      <TitleText style={styles.title}>{item.name}</TitleText>
      <BodyText style={styles.subtitle}>{item.name_in_english}</BodyText>
      <BodyText style={styles.meta}>Класс: {item.class_id}</BodyText>
      <BodyText numberOfLines={3} style={styles.description}>
        {item.description}
      </BodyText>
    </Pressable>
  );

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
        <BodyText style={styles.helperText}>Загружаю подклассы…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError) {
    console.error('Error loading subclasses:', error);
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={styles.errorText}>Ошибка при загрузке подклассов.</BodyText>
        <Pressable onPress={() => refetch()}>
          <BodyText style={styles.linkText}>Повторить запрос</BodyText>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ScreenContainer style={styles.centered}>
        <View style={styles.headerRow}>
          <BackButton />
          <TitleText style={styles.listTitle}>Подклассы</TitleText>
        </View>
        <Pressable onPress={handleCreate} style={styles.createButton}>
          <BodyText style={styles.createButtonText}>+ Создать подкласс</BodyText>
        </Pressable>
        <BodyText style={styles.helperText}>Подклассов пока нет.</BodyText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <BackButton />
        <TitleText style={styles.listTitle}>Подклассы</TitleText>
        <Pressable onPress={handleCreate} style={styles.createButton}>
          <BodyText style={styles.createButtonText}>+ Создать</BodyText>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.subclass_id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    rowGap: 12,
  },
  helperText: {
    marginTop: 4,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  linkText: {
    color: colors.buttonPrimary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  meta: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  listTitle: {
    flex: 1,
    marginBottom: 0,
  },
  createButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  createButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '700',
  },
});
