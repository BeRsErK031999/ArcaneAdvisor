import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { z } from 'zod';

import { createFeat } from '@/features/feats/api/createFeat';
import { updateFeat } from '@/features/feats/api/updateFeat';
import type { FeatCreateInput } from '@/features/feats/api/types';
import { MultiSelectField } from '@/shared/forms/MultiSelectField';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';
import type { SelectOption } from '@/shared/forms/SelectField';
import { getModifiers } from '@/features/dictionaries/api/getModifiers';
import type { Modifiers } from '@/features/dictionaries/api/types';

type FeatFormMode = 'create' | 'edit';

interface FeatFormProps {
  mode?: FeatFormMode;
  featId?: string;
  initialValues?: FeatCreateInput;
  onSuccess?: (featId: string) => void;
  submitLabel?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const ArmorTypeOptions: SelectOption[] = [
  { label: 'Лёгкие доспехи', value: 'light' },
  { label: 'Средние доспехи', value: 'medium' },
  { label: 'Тяжёлые доспехи', value: 'heavy' },
  { label: 'Щит', value: 'shield' },
];

const FeatFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Название способности обязательно'),
    description: z.string().trim().min(1, 'Описание обязательно'),
    caster: z.boolean(),
    required_armor_types: z.array(z.string()).default([]),
    required_modifier_keys: z.array(z.string()).default([]),
    required_min_value: z.string().optional(),
    increase_modifiers: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.required_modifier_keys.length === 0) {
      return;
    }

    const trimmed = data.required_min_value?.trim() ?? '';
    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Укажите минимальное значение характеристики',
        path: ['required_min_value'],
      });
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Введите корректное числовое значение',
        path: ['required_min_value'],
      });
    } else if (parsed < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Минимальное значение должно быть ≥ 1',
        path: ['required_min_value'],
      });
    }
  });

type FeatFormValues = z.infer<typeof FeatFormSchema>;

const mapInitialValues = (values?: FeatCreateInput): FeatFormValues => ({
  name: values?.name ?? '',
  description: values?.description ?? '',
  caster: values?.caster ?? false,
  required_armor_types: values?.required_armor_types ?? [],
  required_modifier_keys: values?.required_modifiers.map((item) => item.modifier) ?? [],
  required_min_value: values?.required_modifiers[0]?.min_value?.toString() ?? '',
  increase_modifiers: values?.increase_modifiers ?? [],
});

export const FeatForm: React.FC<FeatFormProps> = ({
  mode = 'create',
  featId,
  initialValues,
  onSuccess,
  submitLabel,
  showBackButton = false,
  onBackPress,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formDefaultValues = mapInitialValues(initialValues);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isDirty },
  } = useForm<FeatFormValues>({
    resolver: zodResolver(FeatFormSchema),
    defaultValues: formDefaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(mapInitialValues(initialValues));
    }
  }, [initialValues, reset]);

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const modifiersQuery = useQuery<Modifiers>({
    queryKey: ['modifiers'],
    queryFn: getModifiers,
  });

  const modifierOptions: SelectOption[] = React.useMemo(() => {
    if (!modifiersQuery.data) return [];
    return Object.entries(modifiersQuery.data).map(([value, label]) => ({
      value,
      label,
    }));
  }, [modifiersQuery.data]);

  const createMutation = useMutation({
    mutationFn: createFeat,
    onSuccess: (feat) => {
      queryClient.invalidateQueries({ queryKey: ['feats'] });
      if (feat.feat_id) {
        queryClient.setQueryData(['feats', feat.feat_id], feat);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: FeatCreateInput) => {
      if (!featId) {
        throw new Error('featId is required for update');
      }
      return updateFeat(featId, values);
    },
    onSuccess: (updatedFeat) => {
      queryClient.invalidateQueries({ queryKey: ['feats'] });
      if (updatedFeat.feat_id) {
        queryClient.setQueryData(['feats', updatedFeat.feat_id], updatedFeat);
        queryClient.invalidateQueries({ queryKey: ['feats', updatedFeat.feat_id] });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const requiredModifierKeys = watch('required_modifier_keys');

  const parseMinValue = (value?: string) => {
    const trimmed = value?.trim() ?? '';
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return null;
    }
    return parsed;
  };

  const extractSubmitError = (error: unknown, currentMode: FeatFormMode) => {
    if (isAxiosError(error)) {
      const data = error.response?.data as { extra?: { message?: string }[] } | undefined;
      const extraMessage = data?.extra?.find((item) => item.message)?.message;
      if (extraMessage) {
        return extraMessage.toString();
      }
    }

    return currentMode === 'edit'
      ? 'Не удалось сохранить изменения способности. Попробуйте ещё раз.'
      : 'Не удалось сохранить способность. Попробуйте ещё раз.';
  };

  const handleBack = () => {
    if (isDirty) {
      Alert.alert(
        'Есть несохранённые изменения',
        'Есть несохранённые изменения. Выйти без сохранения?',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Выйти',
            style: 'destructive',
            onPress: () => {
              if (onBackPress) {
                onBackPress();
              } else {
                router.back();
              }
            },
          },
        ],
      );
      return;
    }

    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const onSubmit = async (values: FeatFormValues) => {
    setSubmitError(null);
    clearErrors('required_min_value');

    const payload: FeatCreateInput = {
      name: values.name.trim(),
      description: values.description.trim(),
      caster: values.caster,
      required_armor_types: values.required_armor_types,
      required_modifiers: [],
      increase_modifiers: values.increase_modifiers,
    };

    if (requiredModifierKeys.length > 0) {
      const parsedMinValue = parseMinValue(values.required_min_value);
      if (parsedMinValue === null) {
        setError('required_min_value', {
          type: 'manual',
          message: 'Укажите корректное минимальное значение характеристики',
        });
        return;
      }

      payload.required_modifiers = requiredModifierKeys.map((modifier) => ({
        modifier,
        min_value: parsedMinValue,
      }));
    }

    try {
      if (mode === 'edit') {
        await updateMutation.mutateAsync(payload);
        if (onSuccess) {
          onSuccess(featId ?? '');
        } else if (featId) {
          router.replace({
            pathname: '/(tabs)/library/feats/[featId]',
            params: { featId },
          });
        }
      } else {
        const createdFeat = await createMutation.mutateAsync(payload);
        if (onSuccess) {
          onSuccess(createdFeat.feat_id);
        } else {
          router.replace({
            pathname: '/(tabs)/library/feats/[featId]',
            params: { featId: createdFeat.feat_id },
          });
        }
      }
    } catch (error) {
      console.error('Feat form submit error:', error);
      setSubmitError(extractSubmitError(error, mode));
    }
  };

  const finalLabel = submitLabel ?? (mode === 'edit' ? 'Сохранить изменения' : 'Сохранить способность');
  const formTitle = mode === 'edit' ? 'Редактировать способность (feat)' : 'Создать способность (feat)';

  return (
    <FormScreenLayout title={formTitle} showBackButton={showBackButton} onBackPress={handleBack}>
      {submitError ? (
        <Text style={{ color: colors.error, marginBottom: 8 }}>{submitError}</Text>
      ) : null}

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
              placeholder="Двойной удар"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.name?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Описание *</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Опишите эффект способности"
              multiline
              style={[styles.input, styles.textArea]}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.description?.message}</FormErrorText>
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Кастер</Text>
          <Controller
            control={control}
            name="caster"
            render={({ field: { value, onChange } }) => <Switch value={value} onValueChange={onChange} />}
          />
        </View>
        <FormErrorText>{errors.caster?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Controller
          control={control}
          name="required_armor_types"
          render={({ field: { value, onChange } }) => (
            <MultiSelectField
              label="Требуемые типы брони"
              placeholder="Выберите типы брони"
              values={value}
              onChange={onChange}
              options={ArmorTypeOptions}
              errorMessage={errors.required_armor_types?.message}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <Controller
          control={control}
          name="required_modifier_keys"
          render={({ field: { value, onChange } }) => (
            <MultiSelectField
              label="Требуемые характеристики"
              placeholder="Выберите характеристики"
              values={value}
              onChange={onChange}
              options={modifierOptions}
              isLoading={modifiersQuery.isLoading}
              errorMessage={errors.required_modifier_keys?.message}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Минимальное значение характеристики</Text>
        <Controller
          control={control}
          name="required_min_value"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
              placeholder="13"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.required_min_value?.message}</FormErrorText>
        <Text style={styles.helperText}>
          Если выбраны характеристики, укажите одно минимальное значение, которое применится ко всем.
        </Text>
      </View>

      <View style={styles.field}>
        <Controller
          control={control}
          name="increase_modifiers"
          render={({ field: { value, onChange } }) => (
            <MultiSelectField
              label="Увеличиваемые характеристики"
              placeholder="Выберите характеристики"
              values={value}
              onChange={onChange}
              options={modifierOptions}
              isLoading={modifiersQuery.isLoading}
              errorMessage={errors.increase_modifiers?.message}
            />
          )}
        />
      </View>

      <FormSubmitButton title={finalLabel} isSubmitting={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </FormScreenLayout>
  );
};

const styles = StyleSheet.create({
  field: {
    gap: 4,
  },
  label: {
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  section: {
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
