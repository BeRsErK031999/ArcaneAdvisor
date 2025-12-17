import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { useRouter } from 'expo-router';

import { createTool } from '@/features/tools/api/createTool';
import { getToolTypes, type ToolTypeOption } from '@/features/tools/api/getToolTypes';
import { updateTool } from '@/features/tools/api/updateTool';
import {
  ToolCreateSchema,
  type ToolCreateInput,
} from '@/features/tools/api/types';
import { getPieceTypes } from '@/features/dictionaries/api/getPieceTypes';
import { getWeightUnits } from '@/features/dictionaries/api/getWeightUnits';
import { SelectField, type SelectOption } from '@/shared/forms/SelectField';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';
import { BodyText } from '@/shared/ui/Typography';

interface ToolFormProps {
  mode?: 'create' | 'edit';
  toolId?: string;
  initialValues?: ToolCreateInput;
  onSuccess?: (toolId: string) => void;
}

const defaultValues: ToolCreateInput = {
  tool_type: '',
  name: '',
  description: '',
  cost: null,
  weight: null,
  utilizes: [],
};

export function ToolForm({
  mode = 'create',
  toolId,
  initialValues,
  onSuccess,
}: ToolFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formDefaultValues = initialValues ?? defaultValues;
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<ToolCreateInput>({
    resolver: zodResolver(ToolCreateSchema),
    defaultValues: formDefaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  React.useEffect(() => {
    const nextValues = initialValues ?? defaultValues;
    reset(nextValues);
    setCostCountInput(stringifyNumber(nextValues.cost?.count));
    setWeightCountInput(stringifyNumber(nextValues.weight?.count));
    setUtilizeComplexities(
      (nextValues.utilizes ?? []).map((item) => stringifyNumber(item?.complexity)),
    );
  }, [initialValues, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'utilizes',
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    data: toolTypes,
    isLoading: isLoadingToolTypes,
    isError: isErrorToolTypes,
    refetch: refetchToolTypes,
  } = useQuery<ToolTypeOption[], Error>({
    queryKey: ['tool-types'],
    queryFn: getToolTypes,
  });

  const {
    data: pieceTypes,
    isLoading: isLoadingPieceTypes,
    isError: isErrorPieceTypes,
    refetch: refetchPieceTypes,
  } = useQuery<Record<string, string>, Error>({
    queryKey: ['piece-types'],
    queryFn: getPieceTypes,
  });

  const {
    data: weightUnits,
    isLoading: isLoadingWeightUnits,
    isError: isErrorWeightUnits,
    refetch: refetchWeightUnits,
  } = useQuery<Record<string, string>, Error>({
    queryKey: ['weight-units'],
    queryFn: getWeightUnits,
  });

  const isLoadingDictionaries =
    isLoadingToolTypes || isLoadingPieceTypes || isLoadingWeightUnits;

  const toolTypeOptions: SelectOption[] = React.useMemo(
    () =>
      (toolTypes ?? []).map((item: ToolTypeOption) => ({
        value: item.key,
        label: item.label,
      })),
    [toolTypes],
  );

  const pieceTypeOptions: SelectOption[] = React.useMemo(
    () =>
      pieceTypes
        ? Object.entries(pieceTypes).map(([key, label]) => ({
            value: key,
            label: label || key,
          }))
        : [],
    [pieceTypes],
  );

  const weightUnitOptions: SelectOption[] = React.useMemo(
    () =>
      weightUnits
        ? Object.entries(weightUnits).map(([key, label]) => ({
            value: key,
            label: label || key,
          }))
        : [],
    [weightUnits],
  );

  const defaultPieceType = React.useMemo(
    () => pieceTypeOptions[0]?.value ?? 'gp',
    [pieceTypeOptions],
  );

  const defaultWeightUnit = React.useMemo(
    () => weightUnitOptions[0]?.value ?? 'lb',
    [weightUnitOptions],
  );

  const stringifyNumber = (value: number | null | undefined) =>
    value === undefined || value === null ? '' : String(value);

  const [costCountInput, setCostCountInput] = React.useState<string>(() =>
    stringifyNumber(formDefaultValues.cost?.count),
  );
  const [weightCountInput, setWeightCountInput] = React.useState<string>(() =>
    stringifyNumber(formDefaultValues.weight?.count),
  );
  const [utilizeComplexities, setUtilizeComplexities] = React.useState<string[]>(
    () =>
      (formDefaultValues.utilizes ?? []).map((item) =>
        stringifyNumber(item?.complexity),
      ),
  );

  const createMutation = useMutation({
    mutationFn: createTool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: ToolCreateInput) => {
      if (!toolId) {
        throw new Error('toolId is required for update');
      }
      return updateTool(toolId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      if (toolId) {
        queryClient.invalidateQueries({ queryKey: ['tools', toolId] });
      }
    },
  });

  const handleRetryDictionaries = () => {
    refetchToolTypes();
    refetchPieceTypes();
    refetchWeightUnits();
  };

  const navigateToDetails = (id: string) => {
    router.replace({
      pathname: '/(tabs)/library/equipment/tools/[toolId]',
      params: { toolId: id },
    });
  };

  const onSubmit = async (values: ToolCreateInput) => {
    setSubmitError(null);
    try {
      if (mode === 'edit') {
        if (!toolId) {
          setSubmitError('Не удалось определить инструмент для редактирования');
          return;
        }
        await updateMutation.mutateAsync(values);
        onSuccess ? onSuccess(toolId) : navigateToDetails(toolId);
        return;
      }

      const created = await createMutation.mutateAsync(values);
      queryClient.setQueryData(['tools', created.tool_id], created);

      const createdId = created.tool_id;
      if (onSuccess) {
        onSuccess(createdId);
      } else {
        navigateToDetails(createdId);
      }
    } catch (error) {
      console.error('Tool form submit error:', error);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить изменения инструмента. Попробуйте ещё раз.'
          : 'Не удалось создать инструмент. Попробуйте ещё раз.',
      );
    }
  };

  const handleBackPress = () => {
    if (isDirty) {
      Alert.alert(
        'Есть несохранённые изменения',
        'Вы уверены, что хотите выйти без сохранения?',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Покинуть', style: 'destructive', onPress: () => router.back() },
        ],
      );
      return;
    }

    router.back();
  };

  React.useEffect(() => {
    setUtilizeComplexities((prev) =>
      fields.map((field, index) => prev[index] ?? stringifyNumber(field.complexity)),
    );
  }, [fields]);

  const toolTypeValue = watch('tool_type');
  const costValue = watch('cost');
  const weightValue = watch('weight');

  React.useEffect(() => {
    setCostCountInput(stringifyNumber(costValue?.count));
  }, [costValue?.count, costValue]);

  React.useEffect(() => {
    setWeightCountInput(stringifyNumber(weightValue?.count));
  }, [weightValue?.count, weightValue]);

  const handleCostToggle = (enabled: boolean) => {
    if (enabled) {
      setValue('cost', { count: 1, piece_type: defaultPieceType }, { shouldValidate: true });
      setCostCountInput('1');
    } else {
      setValue('cost', null, { shouldValidate: true });
      setCostCountInput('');
    }
  };

  const handleWeightToggle = (enabled: boolean) => {
    if (enabled) {
      setValue('weight', { count: 1, unit: defaultWeightUnit }, { shouldValidate: true });
      setWeightCountInput('1');
    } else {
      setValue('weight', null, { shouldValidate: true });
      setWeightCountInput('');
    }
  };

  const handleNumericChange = (
    text: string,
    onChange: (value: number) => void,
    setInput: (val: string) => void,
  ) => {
    setInput(text);
    const trimmed = text.trim();
    if (trimmed === '') return;

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return;

    onChange(parsed);
  };

  const handleComplexityChange = (
    text: string,
    index: number,
    onChange: (value: number) => void,
  ) => {
    setUtilizeComplexities((prev) => {
      const next = [...prev];
      next[index] = text;
      return next;
    });

    const trimmed = text.trim();
    if (trimmed === '') return;

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return;

    onChange(parsed);
  };

  const handleAddUtilize = () => {
    append({ action: '', complexity: 1 });
    setUtilizeComplexities((prev) => [...prev, '1']);
  };

  const handleRemoveUtilize = (index: number) => {
    remove(index);
    setUtilizeComplexities((prev) => prev.filter((_, i) => i !== index));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const formTitle = mode === 'edit' ? 'Редактировать инструмент' : 'Создать инструмент';
  const submitLabel = mode === 'edit' ? 'Сохранить изменения' : 'Создать инструмент';
  const hasCost = costValue !== null && costValue !== undefined;
  const hasWeight = weightValue !== null && weightValue !== undefined;
  const costPieceTypeValue = costValue?.piece_type ?? '';
  const weightUnitValue = weightValue?.unit ?? '';

  const hasDictionaryError = isErrorToolTypes || isErrorPieceTypes || isErrorWeightUnits;

  return (
    <FormScreenLayout title={formTitle} showBackButton onBackPress={handleBackPress}>
      {submitError ? <FormErrorText>{submitError}</FormErrorText> : null}

      {isLoadingDictionaries ? (
        <View style={styles.infoRow}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю справочники…</BodyText>
        </View>
      ) : null}

      {hasDictionaryError ? (
        <View style={[styles.card, styles.warningCard]}>
          <BodyText style={[styles.helperText, styles.errorText]}>
            Не удалось загрузить справочники
          </BodyText>
          <Pressable style={styles.retryButton} onPress={handleRetryDictionaries}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      ) : null}

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
                placeholder="Воровские инструменты"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          {errors.name ? <FormErrorText>{errors.name.message}</FormErrorText> : null}
        </View>

        <View style={styles.field}>
          <SelectField
            label="Тип инструмента *"
            value={toolTypeValue}
            onChange={(val) => setValue('tool_type', val)}
            options={toolTypeOptions}
            isLoading={isLoadingToolTypes}
            errorMessage={errors.tool_type?.message}
          />
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
                placeholder="Краткое описание"
                style={[styles.input, styles.textArea]}
                placeholderTextColor={colors.inputPlaceholder}
                multiline
              />
            )}
          />
          {errors.description ? (
            <FormErrorText>{errors.description.message}</FormErrorText>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <BodyText style={styles.sectionTitle}>Стоимость</BodyText>
          <View style={styles.switchGroup}>
            <Text style={styles.label}>Есть стоимость</Text>
            <Switch value={hasCost} onValueChange={handleCostToggle} />
          </View>
        </View>

        {hasCost ? (
          <View style={styles.row}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Количество</Text>
              <Controller
                control={control}
                name="cost.count"
                render={({ field: { onChange, onBlur } }) => (
                  <TextInput
                    value={costCountInput}
                    onChangeText={(text) =>
                      handleNumericChange(text, onChange, setCostCountInput)
                    }
                    onBlur={onBlur}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              {errors.cost?.count ? (
                <FormErrorText>{errors.cost.count.message}</FormErrorText>
              ) : null}
            </View>

            <View style={[styles.field, styles.flex1]}>
              <SelectField
                label="Тип монеты *"
                value={costPieceTypeValue}
                onChange={(val) => {
                  if (!hasCost) {
                    handleCostToggle(true);
                  }
                  setValue('cost.piece_type', val, { shouldValidate: true });
                }}
                options={pieceTypeOptions}
                isLoading={isLoadingPieceTypes}
                errorMessage={errors.cost?.piece_type?.message}
              />
            </View>
          </View>
        ) : (
          <BodyText style={styles.helperText}>Стоимость не указана</BodyText>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <BodyText style={styles.sectionTitle}>Вес</BodyText>
          <View style={styles.switchGroup}>
            <Text style={styles.label}>Есть вес</Text>
            <Switch value={hasWeight} onValueChange={handleWeightToggle} />
          </View>
        </View>

        {hasWeight ? (
          <View style={styles.row}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Количество</Text>
              <Controller
                control={control}
                name="weight.count"
                render={({ field: { onChange, onBlur } }) => (
                  <TextInput
                    value={weightCountInput}
                    onChangeText={(text) =>
                      handleNumericChange(text, onChange, setWeightCountInput)
                    }
                    onBlur={onBlur}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              {errors.weight?.count ? (
                <FormErrorText>{errors.weight.count.message}</FormErrorText>
              ) : null}
            </View>

            <View style={[styles.field, styles.flex1]}>
              <SelectField
                label="Единица измерения *"
                value={weightUnitValue}
                onChange={(val) => {
                  if (!hasWeight) {
                    handleWeightToggle(true);
                  }
                  setValue('weight.unit', val, { shouldValidate: true });
                }}
                options={weightUnitOptions}
                isLoading={isLoadingWeightUnits}
                errorMessage={errors.weight?.unit?.message}
              />
            </View>
          </View>
        ) : (
          <BodyText style={styles.helperText}>Вес не указан</BodyText>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <BodyText style={styles.sectionTitle}>Действия *</BodyText>
          <Pressable style={styles.addButton} onPress={handleAddUtilize}>
            <Text style={styles.addButtonText}>+ Добавить действие</Text>
          </Pressable>
        </View>

        {errors.utilizes?.message ? (
          <FormErrorText>{errors.utilizes.message}</FormErrorText>
        ) : null}

        {fields.length === 0 ? (
          <BodyText style={styles.helperText}>Добавьте хотя бы одно действие</BodyText>
        ) : null}

        {fields.map((field, index) => (
          <View key={field.id} style={styles.utilizeCard}>
            <View style={styles.utilizeHeader}>
              <BodyText style={styles.label}>Действие #{index + 1}</BodyText>
              <Pressable onPress={() => handleRemoveUtilize(index)}>
                <Text style={styles.removeText}>Удалить</Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Название</Text>
              <Controller
                control={control}
                name={`utilizes.${index}.action`}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Например, взлом"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              {errors.utilizes?.[index]?.action ? (
                <FormErrorText>{errors.utilizes[index]?.action?.message}</FormErrorText>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Сложность *</Text>
              <Controller
                control={control}
                name={`utilizes.${index}.complexity`}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={utilizeComplexities[index] ?? String(value ?? '')}
                    onChangeText={(text) =>
                      handleComplexityChange(text, index, onChange)
                    }
                    onBlur={onBlur}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              {errors.utilizes?.[index]?.complexity ? (
                <FormErrorText>
                  {errors.utilizes[index]?.complexity?.message}
                </FormErrorText>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <FormSubmitButton
        title={submitLabel}
        onPress={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
      />
    </FormScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 12,
    paddingVertical: 24,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
  },
  warningCard: {
    borderColor: colors.error,
    backgroundColor: colors.surface,
  },
  retryButton: {
    marginTop: 12,
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
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    rowGap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  field: {
    rowGap: 6,
  },
  label: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    columnGap: 12,
  },
  flex1: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.buttonSecondary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  addButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '600',
  },
  utilizeCard: {
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 8,
    padding: 10,
    rowGap: 10,
    backgroundColor: colors.surface,
  },
  utilizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeText: {
    color: colors.error,
    fontWeight: '600',
  },
});
