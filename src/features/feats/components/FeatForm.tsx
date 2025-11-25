import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createFeat } from '@/features/feats/api/createFeat';
import { updateFeat } from '@/features/feats/api/updateFeat';
import { FeatCreateSchema, type FeatCreateInput } from '@/features/feats/api/types';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';

type FeatFormMode = 'create' | 'edit';

interface FeatFormProps {
  mode?: FeatFormMode;
  featId?: string;
  initialValues?: FeatCreateInput;
  onSuccess?: () => void;
  submitLabel?: string;
}

const defaultValues: FeatCreateInput = {
  name: '',
  description: '',
  caster: false,
  required_armor_types: [],
  required_modifiers: [],
  increase_modifiers: [],
};

export const FeatForm: React.FC<FeatFormProps> = ({
  mode = 'create',
  featId,
  initialValues,
  onSuccess,
  submitLabel,
}) => {
  const queryClient = useQueryClient();

  const formDefaultValues = initialValues ?? defaultValues;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeatCreateInput>({
    resolver: zodResolver(FeatCreateSchema),
    defaultValues: formDefaultValues,
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [rawRequiredArmors, setRawRequiredArmors] = React.useState(
    initialValues?.required_armor_types.join(', ') ?? '',
  );
  const [requiredModifiersNames, setRequiredModifiersNames] = React.useState(
    initialValues?.required_modifiers.map((modifier) => modifier.modifier).join(', ') ?? '',
  );
  const [requiredMinValue, setRequiredMinValue] = React.useState(
    initialValues?.required_modifiers[0]?.min_value?.toString() ?? '',
  );
  const [increaseModifiers, setIncreaseModifiers] = React.useState(
    initialValues?.increase_modifiers.join(', ') ?? '',
  );

  React.useEffect(() => {
    if (initialValues) {
      setRawRequiredArmors(initialValues.required_armor_types.join(', '));
      setRequiredModifiersNames(initialValues.required_modifiers.map((m) => m.modifier).join(', '));
      setRequiredMinValue(initialValues.required_modifiers[0]?.min_value?.toString() ?? '');
      setIncreaseModifiers(initialValues.increase_modifiers.join(', '));
    }
  }, [initialValues]);

  const createMutation = useMutation({
    mutationFn: createFeat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feats'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: FeatCreateInput) => {
      if (!featId) {
        throw new Error('featId is required for update');
      }
      return updateFeat(featId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feats'] });
      if (featId) {
        queryClient.invalidateQueries({ queryKey: ['feats', featId] });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: FeatCreateInput) => {
    setSubmitError(null);

    const armorTypes = (rawRequiredArmors ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const modifiers = (requiredModifiersNames ?? '')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m) => ({ modifier: m, min_value: Number(requiredMinValue) || 0 }));

    const increased = (increaseModifiers ?? '')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const payload: FeatCreateInput = {
      ...values,
      required_armor_types: armorTypes,
      required_modifiers: modifiers,
      increase_modifiers: increased,
    };

    try {
      if (mode === 'edit') {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
        reset(defaultValues);
        setRawRequiredArmors('');
        setRequiredModifiersNames('');
        setRequiredMinValue('');
        setIncreaseModifiers('');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Feat form submit error:', error);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить изменения способности. Попробуйте ещё раз.'
          : 'Не удалось сохранить способность. Попробуйте ещё раз.',
      );
    }
  };

  const finalLabel = submitLabel ?? (mode === 'edit' ? 'Сохранить изменения' : 'Сохранить способность');
  const formTitle = mode === 'edit' ? 'Редактировать способность (feat)' : 'Создать способность (feat)';

  return (
    <FormScreenLayout title={formTitle}>
      {submitError ? (
        <Text style={{ color: colors.error, marginBottom: 8 }}>{submitError}</Text>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>Название</Text>
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
        <Text style={styles.label}>Описание</Text>
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
        <Text style={styles.label}>Требуемые типы брони (через запятую)</Text>
        <TextInput
          value={rawRequiredArmors}
          onChangeText={setRawRequiredArmors}
          placeholder="light, medium, heavy"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />
        <FormErrorText>{errors.required_armor_types?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Требуемые характеристики (через запятую)</Text>
        <TextInput
          value={requiredModifiersNames}
          onChangeText={setRequiredModifiersNames}
          placeholder="STR, DEX"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />
        <FormErrorText>{errors.required_modifiers?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Минимальное значение характеристики</Text>
        <TextInput
          value={requiredMinValue}
          onChangeText={setRequiredMinValue}
          keyboardType="numeric"
          placeholder="13"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />
        <FormErrorText>{errors.required_modifiers?.message}</FormErrorText>
        {/* TODO: сделать полноценный редактор модификаторов */}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Увеличиваемые характеристики (через запятую)</Text>
        <TextInput
          value={increaseModifiers}
          onChangeText={setIncreaseModifiers}
          placeholder="STR, CHA"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />
        <FormErrorText>{errors.increase_modifiers?.message}</FormErrorText>
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
});
