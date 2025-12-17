import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { createWeaponProperty } from '@/features/weapon-properties/api/createWeaponProperty';
import { getWeaponPropertyNames } from '@/features/weapon-properties/api/getWeaponPropertyNames';
import { updateWeaponProperty } from '@/features/weapon-properties/api/updateWeaponProperty';
import {
  WeaponPropertyCreateSchema,
  type WeaponPropertyCreateInput,
  type WeaponProperty,
  type WeaponPropertyNameOption,
} from '@/features/weapon-properties/api/types';
import { getLengthUnits } from '@/features/dictionaries/api/getLengthUnits';
import { getDiceTypes } from '@/features/dictionaries/api/getDiceTypes';
import { colors } from '@/shared/theme/colors';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { BodyText } from '@/shared/ui/Typography';

export type WeaponPropertyFormMode = 'create' | 'edit';

interface WeaponPropertyFormProps {
  mode?: WeaponPropertyFormMode; // по умолчанию 'create'
  weaponPropertyId?: string; // обязателен в режиме 'edit'
  initialValues?: WeaponPropertyCreateInput;
  onSuccess?: (createdId?: string) => void;
  submitLabel?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const defaultValues: WeaponPropertyCreateInput = {
  name: '',
  description: '',
  base_range: null,
  max_range: null,
  second_hand_dice: null,
};

export function WeaponPropertyForm({
  mode = 'create',
  weaponPropertyId,
  initialValues,
  onSuccess,
  submitLabel,
  showBackButton,
  onBackPress,
}: WeaponPropertyFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<WeaponPropertyCreateInput>({
    resolver: zodResolver(WeaponPropertyCreateSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: initialValues ?? defaultValues,
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    data: propertyNameOptions,
    isLoading: isLoadingNames,
    isError: isErrorNames,
    error: errorNames,
    refetch: refetchNames,
  } = useQuery<WeaponPropertyNameOption[], Error>({
    queryKey: ['weapon-property-names'],
    queryFn: getWeaponPropertyNames,
  });

  const lengthUnitsQuery = useQuery({ queryKey: ['length-units'], queryFn: getLengthUnits });
  const diceTypesQuery = useQuery({ queryKey: ['dice-types'], queryFn: getDiceTypes });

  const lengthUnitOptions = React.useMemo(
    () =>
      lengthUnitsQuery.data
        ? Object.entries(lengthUnitsQuery.data).map(([key, label]) => ({
            key,
            label: label || key,
          }))
        : [],
    [lengthUnitsQuery.data],
  );

  const diceTypeOptions = React.useMemo(
    () =>
      diceTypesQuery.data
        ? Object.entries(diceTypesQuery.data).map(([key, label]) => ({
            key,
            label: label || key,
          }))
        : [],
    [diceTypesQuery.data],
  );

  const createMutation = useMutation<WeaponProperty, Error, WeaponPropertyCreateInput>({
    mutationFn: createWeaponProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapon-properties'] });
    },
  });

  const updateMutation = useMutation<void, Error, WeaponPropertyCreateInput>({
    mutationFn: async (values: WeaponPropertyCreateInput) => {
      if (!weaponPropertyId) {
        throw new Error('Идентификатор свойства не передан');
      }
      return updateWeaponProperty(weaponPropertyId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapon-properties'] });
      if (weaponPropertyId) {
        queryClient.invalidateQueries({ queryKey: ['weapon-properties', weaponPropertyId] });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const formTitle = mode === 'edit' ? 'Редактировать свойство оружия' : 'Создать свойство оружия';
  const finalSubmitLabel =
    submitLabel ?? (mode === 'edit' ? 'Сохранить изменения' : 'Создать свойство');

  const baseRange = watch('base_range');
  const maxRange = watch('max_range');
  const secondHandDice = watch('second_hand_dice');

  const getDefaultLengthUnit = () => lengthUnitOptions[0]?.key ?? 'ft';
  const getDefaultDiceType = () => diceTypeOptions[0]?.key ?? 'd6';

  const navigateBack = React.useCallback(() => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    router.back();
  }, [onBackPress, router]);

  const handleBackPress = React.useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Есть несохранённые изменения',
        'Есть несохранённые изменения. Выйти без сохранения?',
        [
          { text: 'Остаться', style: 'cancel' },
          { text: 'Выйти', style: 'destructive', onPress: navigateBack },
        ],
      );
      return;
    }

    navigateBack();
  }, [isDirty, navigateBack]);

  const handleSecondHandDiceCountChange = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') return;

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return;

    setValue('second_hand_dice', {
      dice: {
        count: parsed,
        dice_type: secondHandDice?.dice.dice_type ?? getDefaultDiceType(),
      },
    });
  };

  const onSubmit = async (values: WeaponPropertyCreateInput) => {
    setSubmitError(null);
    try {
      if (mode === 'edit') {
        if (!weaponPropertyId) {
          setSubmitError('Не указан идентификатор свойства оружия.');
          return;
        }

        await updateMutation.mutateAsync(values);
        onSuccess?.(weaponPropertyId);

        router.replace({
          pathname: '/(tabs)/library/equipment/weapon-properties/[weaponPropertyId]',
          params: { weaponPropertyId },
        });
        return;
      }

      const created = await createMutation.mutateAsync(values);
      onSuccess?.(created.weapon_property_id);

      router.replace({
        pathname: '/(tabs)/library/equipment/weapon-properties/[weaponPropertyId]',
        params: { weaponPropertyId: created.weapon_property_id },
      });
    } catch (error) {
      console.error('Failed to submit weapon property form', error);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить изменения. Попробуйте ещё раз.'
          : 'Не удалось создать свойство. Попробуйте ещё раз.',
      );
    }
  };

  const renderRangeFields = (
    label: string,
    rangeValue: WeaponPropertyCreateInput['base_range'],
    onChangeSwitch: (value: boolean) => void,
    onChangeCount: (value: number) => void,
    onChangeUnit: (unit: string) => void,
    countError?: string,
    unitError?: string,
  ) => {
    const handleCountChange = (text: string) => {
      const trimmed = text.trim();
      if (trimmed === '') return;

      const parsed = Number(trimmed);
      if (Number.isNaN(parsed)) return;

      onChangeCount(parsed);
    };

    return (
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>{label}</Text>
          <Switch
            value={Boolean(rangeValue)}
            onValueChange={onChangeSwitch}
            trackColor={{ false: colors.borderMuted, true: colors.accentSoft }}
            thumbColor={colors.accent}
          />
        </View>

        {rangeValue ? (
          <View style={styles.rangeRow}>
            <TextInput
              value={rangeValue.range.count.toString()}
              onChangeText={handleCountChange}
              keyboardType="numeric"
              inputMode="numeric"
              style={[styles.input, styles.rangeInput]}
              placeholder="10"
              placeholderTextColor={colors.inputPlaceholder}
            />

            <View style={styles.unitList}>
              {lengthUnitOptions.map((option) => {
                const isSelected = option.key === rangeValue.range.unit;

                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.unitChip,
                      isSelected && styles.unitChipSelected,
                    ]}
                    onPress={() => onChangeUnit(option.key)}
                  >
                    <BodyText style={isSelected ? styles.unitChipTextSelected : styles.unitChipText}>
                      {option.label}
                    </BodyText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <FormErrorText>{countError}</FormErrorText>
        <FormErrorText>{unitError}</FormErrorText>
      </View>
    );
  };

  return (
    <FormScreenLayout
      title={formTitle}
      showBackButton={showBackButton}
      onBackPress={handleBackPress}
    >
      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <View style={styles.formCard}>
        <View style={styles.section}>
          <Text style={styles.label}>Ключ свойства *</Text>

          {isLoadingNames && (
            <View style={styles.stateRow}>
              <ActivityIndicator color={colors.textSecondary} />
              <BodyText style={styles.helperText}>Загружаю список свойств…</BodyText>
            </View>
          )}

          {isErrorNames && (
            <View style={styles.errorBlock}>
              <BodyText style={[styles.helperText, styles.errorText]}>
                Не удалось загрузить список свойств
              </BodyText>
              <BodyText style={styles.errorDetails}>
                {errorNames?.message ?? 'Неизвестная ошибка'}
              </BodyText>
              <Pressable style={styles.retryButton} onPress={() => refetchNames()}>
                <BodyText style={styles.retryButtonText}>Повторить</BodyText>
              </Pressable>
            </View>
          )}

          {!isLoadingNames && !isErrorNames && propertyNameOptions && propertyNameOptions.length > 0 ? (
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <View style={[styles.chipsRow, errors.name && styles.chipsRowError]}>
                  {propertyNameOptions.map((option) => {
                    const isSelected = option.key === value;

                    return (
                      <Pressable
                        key={option.key}
                        style={({ pressed }) => [
                          styles.chip,
                          pressed && styles.chipPressed,
                          isSelected && styles.chipSelected,
                        ]}
                        onPress={() => onChange(option.key)}
                      >
                        <BodyText
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {option.label}
                        </BodyText>
                        <BodyText style={styles.chipSubtext}>{option.key}</BodyText>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
          ) : null}

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
                placeholder="Опишите, как работает это свойство…"
                style={[styles.input, styles.textarea]}
                multiline
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.description?.message}</FormErrorText>
        </View>

        {renderRangeFields(
          'Есть базовая дистанция',
          baseRange,
          (enabled) =>
            setValue(
              'base_range',
              enabled
                ? {
                    range: { count: baseRange?.range.count ?? 5, unit: baseRange?.range.unit ?? getDefaultLengthUnit() },
                  }
                : null,
            ),
          (count) =>
            setValue('base_range', {
              range: { count, unit: baseRange?.range.unit ?? getDefaultLengthUnit() },
            }),
          (unit) =>
            setValue('base_range', {
              range: { unit, count: baseRange?.range.count ?? 5 },
            }),
          errors.base_range?.range?.count?.message,
          errors.base_range?.range?.unit?.message,
        )}

        {renderRangeFields(
          'Есть максимальная дистанция',
          maxRange,
          (enabled) =>
            setValue(
              'max_range',
              enabled
                ? {
                    range: { count: maxRange?.range.count ?? 20, unit: maxRange?.range.unit ?? getDefaultLengthUnit() },
                  }
                : null,
            ),
          (count) =>
            setValue('max_range', {
              range: { count, unit: maxRange?.range.unit ?? getDefaultLengthUnit() },
            }),
          (unit) =>
            setValue('max_range', {
              range: { unit, count: maxRange?.range.count ?? 20 },
            }),
          errors.max_range?.range?.count?.message,
          errors.max_range?.range?.unit?.message,
        )}

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Есть отдельные кости для второй руки</Text>
            <Switch
              value={Boolean(secondHandDice)}
              onValueChange={(enabled) =>
                setValue(
                  'second_hand_dice',
                  enabled
                    ? {
                        dice: {
                          count: secondHandDice?.dice.count ?? 2,
                          dice_type: secondHandDice?.dice.dice_type ?? getDefaultDiceType(),
                        },
                      }
                    : null,
                )
              }
              trackColor={{ false: colors.borderMuted, true: colors.accentSoft }}
              thumbColor={colors.accent}
            />
          </View>

          {secondHandDice ? (
            <View style={styles.rangeRow}>
              <TextInput
                value={secondHandDice.dice.count.toString()}
                onChangeText={handleSecondHandDiceCountChange}
                keyboardType="numeric"
                inputMode="numeric"
                style={[styles.input, styles.rangeInput]}
                placeholder="2"
                placeholderTextColor={colors.inputPlaceholder}
              />

              <View style={styles.unitList}>
                {diceTypeOptions.map((option) => {
                  const isSelected = option.key === secondHandDice.dice.dice_type;
                  return (
                    <Pressable
                      key={option.key}
                      style={[
                        styles.unitChip,
                        isSelected && styles.unitChipSelected,
                      ]}
                      onPress={() =>
                        setValue('second_hand_dice', {
                          dice: { ...secondHandDice.dice, dice_type: option.key },
                        })
                      }
                    >
                      <BodyText
                        style={isSelected ? styles.unitChipTextSelected : styles.unitChipText}
                      >
                        {option.label}
                      </BodyText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <FormErrorText>{errors.second_hand_dice?.dice?.count?.message}</FormErrorText>
          <FormErrorText>{errors.second_hand_dice?.dice?.dice_type?.message}</FormErrorText>
        </View>
      </View>

      <FormSubmitButton
        title={finalSubmitLabel}
        isSubmitting={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </FormScreenLayout>
  );
}

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
    color: colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipsRowError: {
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    backgroundColor: '#331414',
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
    minWidth: 120,
    rowGap: 4,
  },
  chipPressed: {
    backgroundColor: colors.accentSoft,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.accent,
  },
  chipSubtext: {
    color: colors.textMuted,
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
  },
  unitList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  unitChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
  },
  unitChipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  unitChipText: {
    color: colors.textSecondary,
  },
  unitChipTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  helperText: {
    color: colors.textSecondary,
  },
  errorBlock: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: '#331414',
    rowGap: 4,
  },
  errorText: {
    color: colors.error,
    fontWeight: '700',
  },
  errorDetails: {
    color: colors.textMuted,
    fontSize: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.buttonSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  retryButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '600',
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
});
