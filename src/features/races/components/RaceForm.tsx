import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RaceCreateSchema,
  type RaceCreateInput,
} from '@/features/races/api/types';
import { createRace } from '@/features/races/api/createRace';
import { updateRace } from '@/features/races/api/updateRace';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';

type RaceFormMode = 'create' | 'edit';

interface RaceFormProps {
  mode?: RaceFormMode;
  raceId?: string;
  initialValues?: RaceCreateInput;
  onSuccess?: () => void;
  submitLabel?: string;
}

const defaultValues: RaceCreateInput = {
  name: '',
  description: '',
  creature_type: '',
  creature_size: '',
  speed: {
    base_speed: { count: 30, unit: 'ft' },
    description: '',
  },
  age: {
    max_age: 80,
    description: '',
  },
  increase_modifiers: [],
  source_id: '',
  features: [],
  name_in_english: '',
};

export const RaceForm: React.FC<RaceFormProps> = ({
  mode = 'create',
  raceId,
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
  } = useForm<RaceCreateInput>({
    resolver: zodResolver(RaceCreateSchema),
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
    mutationFn: createRace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: RaceCreateInput) => {
      if (!raceId) {
        throw new Error('raceId is required for update');
      }
      return updateRace(raceId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] });
      if (raceId) {
        queryClient.invalidateQueries({ queryKey: ['races', raceId] });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: RaceCreateInput) => {
    setSubmitError(null);

    try {
      const parsedModifiers = abilityBonuses.trim()
        ? (abilityBonuses
            .split(',')
            .map((raw) => {
              const [modifier, bonusRaw] = raw.split(':').map((item) => item.trim());
              const bonus = Number.parseInt(bonusRaw ?? '', 10);

              if (!modifier || Number.isNaN(bonus)) {
                return null;
              }

              return { modifier, bonus };
            })
            .filter(Boolean) as RaceCreateInput['increase_modifiers'])
        : values.increase_modifiers;

      const payload: RaceCreateInput = {
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
    } catch (error) {
      console.error('Race form submit error:', error);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить изменения расы. Попробуйте ещё раз.'
          : 'Не удалось сохранить расу. Попробуйте ещё раз.',
      );
    }
  };

  const finalLabel = submitLabel ?? (mode === 'edit' ? 'Сохранить изменения' : 'Сохранить расу');
  const title = mode === 'edit' ? 'Редактировать расу' : 'Создать расу';

  return (
    <FormScreenLayout title={title}>
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

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
              placeholder="Гном"
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
              placeholder="Dwarf"
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
              placeholder="Опишите расу"
              multiline
              style={[styles.input, styles.textArea]}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.description?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Тип существа</Text>
        <Controller
          control={control}
          name="creature_type"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="humanoid"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.creature_type?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Размер</Text>
        <Controller
          control={control}
          name="creature_size"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="medium"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.creature_size?.message}</FormErrorText>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Скорость</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Базовая скорость</Text>
          <Controller
            control={control}
            name="speed.base_speed.count"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value?.toString() ?? ''}
                onChangeText={(text) => onChange(Number.parseInt(text, 10) || 0)}
                onBlur={onBlur}
                keyboardType="numeric"
                placeholder="30"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.speed?.base_speed?.count?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Единица измерения</Text>
          <Controller
            control={control}
            name="speed.base_speed.unit"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="ft"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.speed?.base_speed?.unit?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Описание скорости</Text>
          <Controller
            control={control}
            name="speed.description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Базовая скорость пешком"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.speed?.description?.message}</FormErrorText>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Возраст</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Максимальный возраст</Text>
          <Controller
            control={control}
            name="age.max_age"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value?.toString() ?? ''}
                onChangeText={(text) => onChange(Number.parseInt(text, 10) || 0)}
                onBlur={onBlur}
                keyboardType="numeric"
                placeholder="80"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.age?.max_age?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Описание возраста</Text>
          <Controller
            control={control}
            name="age.description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Средняя продолжительность жизни"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.age?.description?.message}</FormErrorText>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Модификаторы характеристик</Text>
        <Text style={styles.helperText}>
          strength:+2, charisma:+1
        </Text>
        <TextInput
          value={abilityBonuses}
          onChangeText={setAbilityBonuses}
          placeholder="strength:+2, charisma:+1"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />
        {/* TODO: parse ability bonuses from text with better UX */}
        <FormErrorText>{errors.increase_modifiers?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Источник</Text>
        <Controller
          control={control}
          name="source_id"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="UUID источника"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.source_id?.message}</FormErrorText>
      </View>

      {/* TODO: добавить форму для особенностей */}

      <FormSubmitButton title={finalLabel} isSubmitting={isSubmitting} onPress={handleSubmit(onSubmit)} />
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
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '700',
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
    color: colors.textSecondary,
    fontSize: 12,
  },
});
