import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { createMaterial } from '@/features/materials/api/createMaterial';
import { updateMaterial } from '@/features/materials/api/updateMaterial';
import type { MaterialCreateInput } from '@/features/materials/api/types';
import { MaterialCreateSchema } from '@/features/materials/api/types';
import { getWeightUnits } from '@/features/dictionaries/api/getWeightUnits';
import type { WeightUnits } from '@/features/dictionaries/api/types';
import { getSources } from '@/features/sources/api/getSources';
import type { Source } from '@/features/sources/api/types';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';
import { BodyText } from '@/shared/ui/Typography';

export type MaterialFormMode = 'create' | 'edit';

interface MaterialFormProps {
  materialId?: string;
  mode?: MaterialFormMode;
  initialValues?: MaterialCreateInput;
  onSuccess?: (materialId: string) => void;
  submitLabel?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const defaultValues: MaterialCreateInput = {
  name: '',
  description: '',
  rarity: '',
  source_id: '',
  weight: null,
  cost: null,
};

const pieceTypeOptions = [
  { key: 'cp', label: 'мед' },
  { key: 'sp', label: 'сер' },
  { key: 'gp', label: 'зол' },
  { key: 'pp', label: 'плат' },
] as const;

export function MaterialForm({
  materialId,
  mode = 'create',
  initialValues,
  onSuccess,
  submitLabel,
  showBackButton,
  onBackPress,
}: MaterialFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [hasWeight, setHasWeight] = React.useState(Boolean(initialValues?.weight));
  const [hasCost, setHasCost] = React.useState(Boolean(initialValues?.cost));

  const { control, handleSubmit, formState, reset, setValue, watch } = useForm<MaterialCreateInput>(
    {
      resolver: zodResolver(MaterialCreateSchema),
      defaultValues: initialValues ?? defaultValues,
      mode: 'onBlur',
      reValidateMode: 'onChange',
    },
  );

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
      setHasWeight(Boolean(initialValues.weight));
      setHasCost(Boolean(initialValues.cost));
    }
  }, [initialValues, reset]);

  const { errors } = formState;

  const weightUnitsQuery = useQuery<WeightUnits, Error>({
    queryKey: ['weight-units'],
    queryFn: getWeightUnits,
  });

  const sourcesQuery = useQuery<Source[], Error>({
    queryKey: ['sources'],
    queryFn: getSources,
  });

  const createMutation = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: MaterialCreateInput) => {
      if (!materialId) {
        throw new Error('materialId is required for update');
      }
      return updateMaterial(materialId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      if (materialId) {
        queryClient.invalidateQueries({ queryKey: ['materials', materialId] });
      }
    },
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const weightUnitOptions = React.useMemo(
    () =>
      weightUnitsQuery.data
        ? Object.entries(weightUnitsQuery.data).map(([key, label]) => ({
            key,
            label: label || key,
          }))
        : [],
    [weightUnitsQuery.data],
  );

  const sourceOptions = sourcesQuery.data ?? [];

  const getDefaultWeightUnit = () => weightUnitOptions[0]?.key ?? 'lb';

  const handleToggleWeight = (value: boolean) => {
    setHasWeight(value);
    if (value) {
      setValue('weight', {
        count: initialValues?.weight?.count ?? 1,
        unit: initialValues?.weight?.unit ?? getDefaultWeightUnit(),
      });
    } else {
      setValue('weight', null);
    }
  };

  const handleToggleCost = (value: boolean) => {
    setHasCost(value);
    if (value) {
      setValue('cost', {
        count: initialValues?.cost?.count ?? 1,
        piece_type: initialValues?.cost?.piece_type ?? pieceTypeOptions[0].key,
      });
    } else {
      setValue('cost', null);
    }
  };

  const handleWeightCountChange = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') return;

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return;

    setValue('weight', {
      count: parsed,
      unit: watch('weight')?.unit ?? getDefaultWeightUnit(),
    });
  };

  const handleCostCountChange = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') return;

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return;

    setValue('cost', {
      count: parsed,
      piece_type: watch('cost')?.piece_type ?? pieceTypeOptions[0].key,
    });
  };

  const onSubmit = async (values: MaterialCreateInput) => {
    setSubmitError(null);

    const payload: MaterialCreateInput = {
      ...values,
      weight: hasWeight ? values.weight : null,
      cost: hasCost ? values.cost : null,
    };

    try {
      let materialIdForSuccess: string | null = null;
      if (mode === 'edit') {
        if (!materialId) {
          setSubmitError('Не удалось сохранить материал.');
          return;
        }

        await updateMutation.mutateAsync(payload);
        materialIdForSuccess = materialId;
      } else {
        const created = await createMutation.mutateAsync(payload);
        materialIdForSuccess = created.material_id;
      }

      if (materialIdForSuccess) {
        onSuccess?.(materialIdForSuccess);
        return;
      }

      router.back();
    } catch (error) {
      console.error('MaterialForm submit error:', error);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить материал. Попробуйте ещё раз.'
          : 'Не удалось создать материал. Попробуйте ещё раз.',
      );
    }
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    router.back();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const finalSubmitLabel = submitLabel ?? (mode === 'edit' ? 'Сохранить' : 'Создать материал');

  const selectedSourceId = watch('source_id');
  const selectedWeightUnit = watch('weight')?.unit;
  const selectedPieceType = watch('cost')?.piece_type;

  const effectiveWeightOptions =
    weightUnitOptions.length > 0 ? weightUnitOptions : [{ key: 'lb', label: 'lb' }];

  return (
    <FormScreenLayout
      title={mode === 'edit' ? 'Редактировать материал' : 'Создать материал'}
      showBackButton={showBackButton}
      onBackPress={handleBack}
    >
      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <View style={styles.card}>
        <BodyText style={styles.sectionTitle}>Основное</BodyText>

        <View style={styles.field}>
          <Text style={styles.label}>Название *</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={styles.input}
                placeholder="Название материала"
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.name?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Редкость *</Text>
          <Controller
            control={control}
            name="rarity"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={styles.input}
                placeholder="Например, распространённый"
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.rarity?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Описание</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={[styles.input, styles.textarea]}
                placeholder="Опишите свойства материала"
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.description?.message}</FormErrorText>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Источник *</Text>

        {sourcesQuery.isLoading ? (
          <View style={styles.stateRow}>
            <BodyText style={styles.helperText}>Загружаю источники…</BodyText>
          </View>
        ) : null}

        {sourcesQuery.isError ? (
          <View style={styles.errorBlock}>
            <BodyText style={[styles.helperText, styles.errorText]}>Не удалось загрузить источники</BodyText>
            <BodyText style={styles.errorDetails}>
              {sourcesQuery.error?.message ?? 'Неизвестная ошибка'}
            </BodyText>
            <Pressable style={styles.retryButton} onPress={() => sourcesQuery.refetch()}>
              <BodyText style={styles.retryButtonText}>Повторить</BodyText>
            </Pressable>
          </View>
        ) : null}

        {!sourcesQuery.isLoading && sourceOptions.length > 0 ? (
          <Controller
            control={control}
            name="source_id"
            render={({ field: { onChange } }) => (
              <View style={[styles.chipsRow, errors.source_id && styles.chipsRowError]}>
                {sourceOptions.map((source) => {
                  const isSelected = selectedSourceId === source.source_id;
                  return (
                    <Pressable
                      key={source.source_id}
                      style={({ pressed }) => [
                        styles.chip,
                        pressed && styles.chipPressed,
                        isSelected && styles.chipSelected,
                      ]}
                      onPress={() => onChange(source.source_id)}
                    >
                      <BodyText
                        style={[styles.chipText, isSelected && styles.chipTextSelected]}
                      >
                        {source.name}
                      </BodyText>
                      {source.name_in_english ? (
                        <BodyText style={styles.chipSubtext}>{source.name_in_english}</BodyText>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
        ) : null}

        <FormErrorText>{errors.source_id?.message}</FormErrorText>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <BodyText style={styles.sectionTitle}>Стоимость</BodyText>
          <View style={styles.switchRow}>
            <BodyText>Есть стоимость</BodyText>
            <Switch
              value={hasCost}
              onValueChange={handleToggleCost}
              trackColor={{ false: colors.borderMuted, true: colors.accentSoft }}
              thumbColor={colors.accent}
            />
          </View>
        </View>

        {hasCost ? (
          <View style={styles.inlineRow}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Количество</Text>
              <TextInput
                value={hasCost ? String(watch('cost')?.count ?? '') : ''}
                onChangeText={handleCostCountChange}
                keyboardType="numeric"
                style={styles.input}
                placeholder="1"
                placeholderTextColor={colors.inputPlaceholder}
              />
              <FormErrorText>{errors.cost?.count?.message}</FormErrorText>
            </View>

            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Тип монеты</Text>
              <View style={styles.chipsRow}>
                {pieceTypeOptions.map((option) => {
                  const isSelected = selectedPieceType === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() =>
                        setValue('cost', {
                          count: watch('cost')?.count ?? 1,
                          piece_type: option.key,
                        })
                      }
                    >
                      <BodyText
                        style={[styles.chipText, isSelected && styles.chipTextSelected]}
                      >
                        {option.label}
                      </BodyText>
                    </Pressable>
                  );
                })}
              </View>
              <FormErrorText>{errors.cost?.piece_type?.message}</FormErrorText>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <BodyText style={styles.sectionTitle}>Вес</BodyText>
          <View style={styles.switchRow}>
            <BodyText>Есть вес</BodyText>
            <Switch
              value={hasWeight}
              onValueChange={handleToggleWeight}
              trackColor={{ false: colors.borderMuted, true: colors.accentSoft }}
              thumbColor={colors.accent}
            />
          </View>
        </View>

        {weightUnitsQuery.isError ? (
          <View style={styles.errorBlock}>
            <BodyText style={[styles.helperText, styles.errorText]}>
              Не удалось загрузить единицы веса
            </BodyText>
            <BodyText style={styles.errorDetails}>
              {weightUnitsQuery.error?.message ?? 'Неизвестная ошибка'}
            </BodyText>
            <Pressable style={styles.retryButton} onPress={() => weightUnitsQuery.refetch()}>
              <BodyText style={styles.retryButtonText}>Повторить</BodyText>
            </Pressable>
          </View>
        ) : null}

        {hasWeight ? (
          <View style={styles.inlineRow}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Количество</Text>
              <TextInput
                value={hasWeight ? String(watch('weight')?.count ?? '') : ''}
                onChangeText={handleWeightCountChange}
                keyboardType="numeric"
                style={styles.input}
                placeholder="1"
                placeholderTextColor={colors.inputPlaceholder}
              />
              <FormErrorText>{errors.weight?.count?.message}</FormErrorText>
            </View>

            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Единица</Text>
              <View style={styles.chipsRow}>
                {effectiveWeightOptions.map((option) => {
                  const isSelected = selectedWeightUnit === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() =>
                        setValue('weight', {
                          count: watch('weight')?.count ?? 1,
                          unit: option.key,
                        })
                      }
                    >
                      <BodyText
                        style={[styles.chipText, isSelected && styles.chipTextSelected]}
                      >
                        {option.label}
                      </BodyText>
                    </Pressable>
                  );
                })}
              </View>
              <FormErrorText>{errors.weight?.unit?.message}</FormErrorText>
            </View>
          </View>
        ) : null}
      </View>

      <FormSubmitButton
        title={finalSubmitLabel}
        onPress={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        disabled={isSubmitting}
      />
    </FormScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  field: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  inlineRow: {
    flexDirection: 'row',
    columnGap: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
  },
  chipsRowError: {
    borderWidth: 1,
    borderColor: colors.error,
    padding: 8,
    borderRadius: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  chipSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
  },
  errorDetails: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  retryButton: {
    marginTop: 8,
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
  errorBlock: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.surface,
    marginBottom: 8,
    rowGap: 4,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginBottom: 8,
  },
  submitError: {
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  flex1: {
    flex: 1,
  },
});
