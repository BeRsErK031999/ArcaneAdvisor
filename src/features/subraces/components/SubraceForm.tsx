import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSubrace } from '@/features/subraces/api/createSubrace';
import { updateSubrace } from '@/features/subraces/api/updateSubrace';
import { SubraceCreateSchema, type SubraceCreateInput } from '@/features/subraces/api/types';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';

type SubraceFormMode = 'create' | 'edit';

interface SubraceFormProps {
  mode?: SubraceFormMode;
  subraceId?: string;
  initialValues?: SubraceCreateInput;
  onSuccess?: () => void;
  submitLabel?: string;
}

const defaultValues: SubraceCreateInput = {
  race_id: '',
  name: '',
  description: '',
  increase_modifiers: [],
  name_in_english: '',
  features: [],
};

export const SubraceForm: React.FC<SubraceFormProps> = ({
  mode = 'create',
  subraceId,
  initialValues,
  onSuccess,
  submitLabel,
}) => {
  const queryClient = useQueryClient();
  const formDefaultValues = initialValues ?? defaultValues;
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubraceCreateInput>({
    resolver: zodResolver(SubraceCreateSchema),
    defaultValues: formDefaultValues,
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [abilityBonuses, setAbilityBonuses] = React.useState('');

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
      if (initialValues.increase_modifiers?.length) {
        const bonusesText = initialValues.increase_modifiers
          .map(
            (modifier) => `${modifier.modifier}:${modifier.bonus >= 0 ? '+' : ''}${modifier.bonus}`,
          )
          .join(', ');
        setAbilityBonuses(bonusesText);
      } else {
        setAbilityBonuses('');
      }
    }
  }, [initialValues, reset]);

  const createMutation = useMutation({
    mutationFn: createSubrace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subraces'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: SubraceCreateInput) => {
      if (!subraceId) {
        throw new Error('subraceId is required for update');
      }
      return updateSubrace(subraceId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subraces'] });
      if (subraceId) {
        queryClient.invalidateQueries({ queryKey: ['subraces', subraceId] });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: SubraceCreateInput) => {
    try {
      setSubmitError(null);

      const parsedModifiers = abilityBonuses.trim()
        ? (abilityBonuses
            .split(',')
            .map((raw) => {
              const [modifier, bonusRaw] = raw.split(':').map((item) => item.trim());
              const bonus = Number.parseInt(bonusRaw ?? '', 10);

              if (!modifier || Number.isNaN(bonus)) {
                return null;
              }

              return { modifier, bonus } as SubraceCreateInput['increase_modifiers'][number];
            })
            .filter(Boolean) as SubraceCreateInput['increase_modifiers'])
        : values.increase_modifiers;

      const payload: SubraceCreateInput = {
        ...values,
        increase_modifiers: parsedModifiers,
      };

      if (mode === 'edit') {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
        reset(defaultValues);
        setAbilityBonuses('');
      }

      onSuccess?.();
    } catch (e) {
      console.error('Failed to create subrace', e);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить изменения подрасы. Попробуйте ещё раз.'
          : 'Не удалось сохранить подрасу. Попробуйте ещё раз.',
      );
    }
  };

  const title = mode === 'edit' ? 'Редактировать подрасу' : 'Создать подрасу';
  const finalLabel = submitLabel ?? (mode === 'edit' ? 'Сохранить изменения' : 'Сохранить подрасу');

  return (
    <FormScreenLayout title={title}>
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      <View style={styles.field}>
        <Text style={styles.label}>UUID расы</Text>
        <Controller
          control={control}
          name="race_id"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="00000000-0000-0000-0000-000000000000"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.race_id?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Название подрасы</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Лесной эльф"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.name?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Английское название</Text>
        <Controller
          control={control}
          name="name_in_english"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Wood Elf"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.name_in_english?.message}</FormErrorText>
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
              placeholder="Опишите подрасу"
              multiline
              style={[styles.input, styles.textArea]}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.description?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Бонусы к характеристикам (через запятую)</Text>
        <TextInput
          value={abilityBonuses}
          onChangeText={setAbilityBonuses}
          placeholder="DEX:+2, CHA:+1"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />
        <Text style={styles.helperText}>
          Введите бонусы в формате MOD:+N. Поле необязательно.
        </Text>
      </View>

      <FormSubmitButton
        title={finalLabel}
        isSubmitting={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </FormScreenLayout>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
    marginBottom: 8,
    fontWeight: '600',
  },
  field: {
    gap: 4,
  },
  label: {
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
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
    fontSize: 12,
    color: colors.textSecondary,
  },
});
