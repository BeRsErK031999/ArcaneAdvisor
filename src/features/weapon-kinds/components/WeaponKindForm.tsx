import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { createWeaponKind } from '@/features/weapon-kinds/api/createWeaponKind';
import { getWeaponTypes } from '@/features/weapon-kinds/api/getWeaponTypes';
import { updateWeaponKind } from '@/features/weapon-kinds/api/updateWeaponKind';
import {
  WeaponKindCreateSchema,
  type WeaponKindCreateInput,
  type WeaponTypeOption,
} from '@/features/weapon-kinds/api/types';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';
import { BodyText } from '@/shared/ui/Typography';

export type WeaponKindFormMode = 'create' | 'edit';

interface WeaponKindFormProps {
  mode?: WeaponKindFormMode;
  weaponKindId?: string;
  initialValues?: WeaponKindCreateInput;
  onSuccess?: () => void;
  submitLabel?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const defaultValues: WeaponKindCreateInput = {
  weapon_type: '',
  name: '',
  description: '',
};

export const WeaponKindForm: React.FC<WeaponKindFormProps> = ({
  mode = 'create',
  weaponKindId,
  initialValues,
  onSuccess,
  submitLabel,
  showBackButton,
  onBackPress,
}) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<WeaponKindCreateInput>({
    resolver: zodResolver(WeaponKindCreateSchema),
    defaultValues: initialValues ?? defaultValues,
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const {
    data: weaponTypes,
    isLoading: isLoadingWeaponTypes,
    isError: isErrorWeaponTypes,
    error: weaponTypesError,
    refetch: refetchWeaponTypes,
  } = useQuery<WeaponTypeOption[], Error>({
    queryKey: ['weapon-types'],
    queryFn: getWeaponTypes,
  });

  const createMutation = useMutation({
    mutationFn: createWeaponKind,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapon-kinds'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: WeaponKindCreateInput) => {
      if (!weaponKindId) {
        throw new Error('weaponKindId is required for update');
      }
      return updateWeaponKind(weaponKindId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapon-kinds'] });
      if (weaponKindId) {
        queryClient.invalidateQueries({ queryKey: ['weapon-kinds', weaponKindId] });
      }
    },
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const onSubmit = async (values: WeaponKindCreateInput) => {
    setSubmitError(null);
    try {
      if (mode === 'edit') {
        if (!weaponKindId) {
          setSubmitError('Не удалось сохранить изменения типа оружия.');
          return;
        }
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
        reset(defaultValues);
      }

      onSuccess?.();
    } catch (error) {
      console.error('WeaponKindForm submit error:', error);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить изменения типа оружия. Попробуйте ещё раз.'
          : 'Не удалось создать тип оружия. Попробуйте ещё раз.',
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const formTitle =
    mode === 'edit' ? 'Редактировать тип оружия' : 'Создать тип оружия';
  const finalSubmitLabel =
    submitLabel ??
    (mode === 'edit' ? 'Сохранить изменения' : 'Создать тип оружия');
  const selectedWeaponType = watch('weapon_type');

  return (
    <FormScreenLayout
      title={formTitle}
      showBackButton={showBackButton}
      onBackPress={onBackPress}
    >
      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <View style={styles.formCard}>
        <View style={styles.section}>
          <Text style={styles.label}>Тип оружия</Text>

          {isLoadingWeaponTypes && (
            <BodyText style={styles.helperText}>Загружаю типы оружия…</BodyText>
          )}

          {isErrorWeaponTypes && (
            <View style={styles.errorBlock}>
              <BodyText style={[styles.helperText, styles.errorText]}>
                Не удалось загрузить типы оружия
              </BodyText>
              <BodyText style={styles.errorDetails}>
                {weaponTypesError?.message ?? 'Неизвестная ошибка'}
              </BodyText>
              <Pressable
                style={styles.retryButton}
                onPress={() => refetchWeaponTypes()}
              >
                <BodyText style={styles.retryButtonText}>Повторить</BodyText>
              </Pressable>
            </View>
          )}

          {!isLoadingWeaponTypes && weaponTypes && weaponTypes.length > 0 ? (
            <View style={styles.chipsRow}>
              {weaponTypes.map((option) => (
                <Pressable
                  key={option.key}
                  style={({ pressed }) => [
                    styles.chip,
                    pressed && styles.chipPressed,
                    {
                      backgroundColor:
                        pressed || option.key === selectedWeaponType
                          ? colors.accentSoft
                          : colors.surface,
                      borderColor:
                        option.key === selectedWeaponType
                          ? colors.accent
                          : colors.borderMuted,
                    },
                  ]}
                  onPress={() => setValue('weapon_type', option.key)}
                >
                  <BodyText
                    style={[
                      styles.chipText,
                      option.key === selectedWeaponType && styles.chipTextActive,
                    ]}
                  >
                    {option.label}
                  </BodyText>
                </Pressable>
              ))}
            </View>
          ) : null}

          <FormErrorText>{errors.weapon_type?.message}</FormErrorText>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Название</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Короткий меч"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.name?.message}</FormErrorText>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Описание</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Опишите особенности этого типа оружия"
                style={[styles.input, styles.textarea]}
                placeholderTextColor={colors.inputPlaceholder}
                multiline
              />
            )}
          />
          <FormErrorText>{errors.description?.message}</FormErrorText>
        </View>
      </View>

      <FormSubmitButton
        title={finalSubmitLabel}
        isSubmitting={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </FormScreenLayout>
  );
};

const styles = StyleSheet.create({
  submitError: {
    color: colors.error,
    marginBottom: 8,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    rowGap: 16,
  },
  section: {
    rowGap: 8,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  helperText: {
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorBlock: {
    rowGap: 8,
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
  },
  errorDetails: {
    color: colors.textMuted,
    fontSize: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  retryButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipPressed: {
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
