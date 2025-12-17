import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { createMaterialComponent } from '@/features/material-components/api/createMaterialComponent';
import { updateMaterialComponent } from '@/features/material-components/api/updateMaterialComponent';
import {
  MaterialComponentCreateSchema,
  type MaterialComponentCreateInput,
} from '@/features/material-components/api/types';
import { getMaterials } from '@/features/materials/api/getMaterials';
import type { Material } from '@/features/materials/api/types';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';
import { BodyText } from '@/shared/ui/Typography';

export type MaterialComponentFormMode = 'create' | 'edit';

interface MaterialComponentFormProps {
  mode?: MaterialComponentFormMode;
  materialComponentId?: string;
  initialValues?: MaterialComponentCreateInput;
  onSuccess?: (materialComponentId: string) => void;
  submitLabel?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const defaultValues: MaterialComponentCreateInput = {
  name: '',
  description: '',
  material_id: null,
  cost: null,
  consumed: false,
};

const pieceTypeOptions = [
  { key: 'cp', label: 'cp' },
  { key: 'sp', label: 'sp' },
  { key: 'gp', label: 'gp' },
  { key: 'pp', label: 'pp' },
] as const;

export function MaterialComponentForm({
  mode = 'create',
  materialComponentId,
  initialValues,
  onSuccess,
  submitLabel,
  showBackButton,
  onBackPress,
}: MaterialComponentFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [hasCost, setHasCost] = React.useState(Boolean(initialValues?.cost));

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<MaterialComponentCreateInput>({
    resolver: zodResolver(MaterialComponentCreateSchema),
    defaultValues: initialValues ?? defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
      setHasCost(Boolean(initialValues.cost));
    }
  }, [initialValues, reset]);

  const materialsQuery = useQuery<Material[], Error>({
    queryKey: ['materials'],
    queryFn: getMaterials,
  });

  const materialOptions = materialsQuery.data ?? [];
  const selectedMaterialId = watch('material_id');
  const selectedPieceType = watch('cost')?.piece_type;

  const createMutation = useMutation({
    mutationFn: createMaterialComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-components'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: MaterialComponentCreateInput) => {
      if (!materialComponentId) {
        throw new Error('materialComponentId is required for update');
      }
      return updateMaterialComponent(materialComponentId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-components'] });
      if (materialComponentId) {
        queryClient.invalidateQueries({ queryKey: ['material-components', materialComponentId] });
      }
    },
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);

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

  const onSubmit = async (values: MaterialComponentCreateInput) => {
    setSubmitError(null);

    const payload: MaterialComponentCreateInput = {
      ...values,
      description: values.description ?? '',
      cost: hasCost ? values.cost : null,
    };

    try {
      let createdId: string | null = null;

      if (mode === 'edit') {
        if (!materialComponentId) {
          setSubmitError('Не удалось сохранить компонент.');
          return;
        }

        await updateMutation.mutateAsync(payload);
        createdId = materialComponentId;
      } else {
        const created = await createMutation.mutateAsync(payload);
        createdId = created.material_component_id;
      }

      if (createdId) {
        onSuccess?.(createdId);
      }
    } catch (error) {
      console.error('MaterialComponentForm submit error:', error);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить изменения. Попробуйте ещё раз.'
          : 'Не удалось создать компонент. Попробуйте ещё раз.',
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const formTitle = mode === 'edit' ? 'Редактировать компонент' : 'Создать компонент';
  const finalSubmitLabel = submitLabel ?? (mode === 'edit' ? 'Сохранить изменения' : 'Создать');

  return (
    <FormScreenLayout
      title={formTitle}
      showBackButton={showBackButton}
      onBackPress={handleBackPress}
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
                placeholder="Название компонента"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.name?.message}</FormErrorText>
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
                placeholder="Описание компонента"
                style={[styles.input, styles.textarea]}
                placeholderTextColor={colors.inputPlaceholder}
                multiline
              />
            )}
          />
          <FormErrorText>{errors.description?.message}</FormErrorText>
        </View>
      </View>

      <View style={styles.card}>
        <BodyText style={styles.sectionTitle}>Материал</BodyText>

        {materialsQuery.isLoading ? (
          <BodyText style={styles.helperText}>Загружаю материалы…</BodyText>
        ) : null}

        {materialsQuery.isError ? (
          <View style={styles.errorBlock}>
            <BodyText style={[styles.helperText, styles.errorText]}>Справочник материалов не загрузился</BodyText>
            <BodyText style={styles.errorDetails}>
              {materialsQuery.error?.message ?? 'Неизвестная ошибка'}
            </BodyText>
            <Pressable style={styles.retryButton} onPress={() => materialsQuery.refetch()}>
              <BodyText style={styles.retryButtonText}>Повторить</BodyText>
            </Pressable>
          </View>
        ) : null}

        <Controller
          control={control}
          name="material_id"
          render={({ field: { onChange } }) => (
            <View style={[styles.chipsContainer, errors.material_id && styles.chipsContainerError]}>
              <View style={styles.chipsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.chip,
                    pressed && styles.chipPressed,
                    selectedMaterialId === null && styles.chipSelected,
                  ]}
                  onPress={() => onChange(null)}
                >
                  <BodyText
                    style={[
                      styles.chipText,
                      selectedMaterialId === null && styles.chipTextSelected,
                    ]}
                  >
                    — Без материала
                  </BodyText>
                </Pressable>

                {materialOptions.map((material) => {
                  const isSelected = selectedMaterialId === material.material_id;
                  return (
                    <Pressable
                      key={material.material_id}
                      style={({ pressed }) => [
                        styles.chip,
                        pressed && styles.chipPressed,
                        isSelected && styles.chipSelected,
                      ]}
                      onPress={() => onChange(material.material_id)}
                    >
                      <BodyText
                        style={[styles.chipText, isSelected && styles.chipTextSelected]}
                      >
                        {material.name}
                      </BodyText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        />
        <FormErrorText>{errors.material_id?.message}</FormErrorText>
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
              <View style={[styles.chipsRow, errors.cost?.piece_type && styles.chipsRowError]}>
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
          <BodyText style={styles.sectionTitle}>Расходуется</BodyText>
          <Controller
            control={control}
            name="consumed"
            render={({ field: { value, onChange } }) => (
              <View style={styles.switchRow}>
                <BodyText>Расходуется</BodyText>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.borderMuted, true: colors.accentSoft }}
                  thumbColor={colors.accent}
                />
              </View>
            )}
          />
        </View>
        <BodyText style={styles.helperText}>
          Если включено — компонент исчезает при использовании
        </BodyText>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    rowGap: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  field: {
    rowGap: 8,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
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
  helperText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorBlock: {
    rowGap: 6,
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
  chipsContainer: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  chipsContainerError: {
    borderColor: colors.error,
    backgroundColor: colors.surfaceElevated,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipPressed: {
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 12,
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
  flex1: {
    flex: 1,
  },
});
