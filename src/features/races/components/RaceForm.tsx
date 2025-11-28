import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RaceCreateSchema,
  type RaceCreateInput,
} from '@/features/races/api/types';
import { createRace } from '@/features/races/api/createRace';
import { updateRace } from '@/features/races/api/updateRace';
import { getSources } from '@/features/sources/api/getSources';
import { getCreatureTypes } from '@/features/dictionaries/api/getCreatureTypes';
import { getCreatureSizes } from '@/features/dictionaries/api/getCreatureSizes';
import { getLengthUnits } from '@/features/dictionaries/api/getLengthUnits';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { BackButton } from '@/shared/ui/BackButton';
import { SelectField } from '@/shared/forms/SelectField';
import { MultiSelectField } from '@/shared/forms/MultiSelectField';
import type { SelectOption } from '@/shared/forms/SelectField';
import { colors } from '@/shared/theme/colors';

type RaceFormMode = 'create' | 'edit';

const ABILITY_OPTIONS: SelectOption[] = [
  { value: 'strength', label: 'Сила (STR)' },
  { value: 'dexterity', label: 'Ловкость (DEX)' },
  { value: 'constitution', label: 'Телосложение (CON)' },
  { value: 'intelligence', label: 'Интеллект (INT)' },
  { value: 'wisdom', label: 'Мудрость (WIS)' },
  { value: 'charisma', label: 'Харизма (CHA)' },
];

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

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const { data: sources, isLoading: isSourcesLoading } = useQuery({
    queryKey: ['sources'],
    queryFn: getSources,
  });

  const { data: creatureTypes, isLoading: isCreatureTypesLoading } = useQuery({
    queryKey: ['creature-types'],
    queryFn: getCreatureTypes,
  });

  const { data: creatureSizes, isLoading: isCreatureSizesLoading } = useQuery({
    queryKey: ['creature-sizes'],
    queryFn: getCreatureSizes,
  });

  const { data: lengthUnits, isLoading: isLengthUnitsLoading } = useQuery({
    queryKey: ['length-units'],
    queryFn: getLengthUnits,
  });

  const sourceOptions: SelectOption[] = React.useMemo(
    () =>
      sources
        ? sources.map((s) => ({
            value: s.source_id,
            label: s.name,
          }))
        : [],
    [sources],
  );

  const creatureTypeOptions: SelectOption[] = React.useMemo(
    () =>
      creatureTypes
        ? Object.entries(creatureTypes).map(([key, value]) => ({
            value: key,
            label: value,
          }))
        : [],
    [creatureTypes],
  );

  const creatureSizeOptions: SelectOption[] = React.useMemo(
    () =>
      creatureSizes
        ? Object.entries(creatureSizes).map(([key, value]) => ({
            value: key,
            label: value,
          }))
        : [],
    [creatureSizes],
  );

  const lengthUnitOptions: SelectOption[] = React.useMemo(
    () =>
      lengthUnits
        ? Object.entries(lengthUnits).map(([key, value]) => ({
            value: key,
            label: value,
          }))
        : [],
    [lengthUnits],
  );

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
      if (mode === 'edit') {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
        reset(defaultValues);
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
    <FormScreenLayout title={title} leftAction={<BackButton />}>
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
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Тип существа"
              placeholder="Выберите тип (например, humanoid)"
              value={value}
              onChange={onChange}
              options={creatureTypeOptions}
              isLoading={isCreatureTypesLoading}
              errorMessage={errors.creature_type?.message}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Размер</Text>
        <Controller
          control={control}
          name="creature_size"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Размер"
              placeholder="Выберите размер (small, medium, large...)"
              value={value}
              onChange={onChange}
              options={creatureSizeOptions}
              isLoading={isCreatureSizesLoading}
              errorMessage={errors.creature_size?.message}
            />
          )}
        />
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
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  const numeric = Number.parseInt(numericText, 10);
                  onChange(Number.isNaN(numeric) ? 0 : numeric);
                }}
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
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Единица измерения"
                placeholder="Выберите единицу (ft, m...)"
                value={value}
                onChange={onChange}
                options={lengthUnitOptions}
                isLoading={isLengthUnitsLoading}
                errorMessage={errors.speed?.base_speed?.unit?.message}
              />
            )}
          />
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Модификаторы характеристик</Text>

        <Controller
          control={control}
          name="increase_modifiers"
          render={({ field: { value, onChange } }) => {
            const rows = value ?? [];

            const handleChangeRow = (index: number, patch: Partial<(typeof rows)[number]>) => {
              const next = [...rows];
              next[index] = { ...next[index], ...patch };
              onChange(next);
            };

            const handleAddRow = () => {
              onChange([...rows, { modifier: 'strength', bonus: 0 }]);
            };

            const handleRemoveRow = (index: number) => {
              const next = rows.filter((_, i) => i !== index);
              onChange(next);
            };

            return (
              <View style={{ gap: 8 }}>
                {rows.map((row, index) => (
                  <View key={index} style={styles.modifierRow}>
                    <View style={{ flex: 1 }}>
                      <SelectField
                        label={`Характеристика ${index + 1}`}
                        placeholder="Выберите характеристику"
                        value={row?.modifier}
                        onChange={(modifier) => handleChangeRow(index, { modifier })}
                        options={ABILITY_OPTIONS}
                        errorMessage={errors.increase_modifiers?.message}
                      />
                    </View>
                    <View style={styles.bonusFieldContainer}>
                      <Text style={styles.label}>Бонус</Text>
                      <TextInput
                        value={row?.bonus?.toString() ?? '0'}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9-]/g, '');
                          const n = Number.parseInt(cleaned, 10);
                          handleChangeRow(index, { bonus: Number.isNaN(n) ? 0 : n });
                        }}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor={colors.inputPlaceholder}
                      />
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveRow(index)}>
                      <Text style={styles.removeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity onPress={handleAddRow}>
                  <Text style={styles.addModifierText}>+ Добавить модификатор</Text>
                </TouchableOpacity>

                <FormErrorText>{errors.increase_modifiers?.message}</FormErrorText>
              </View>
            );
          }}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Источник</Text>
        <Controller
          control={control}
          name="source_id"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Источник"
              placeholder="Выберите источник"
              value={value}
              onChange={onChange}
              options={sourceOptions}
              isLoading={isSourcesLoading}
              errorMessage={errors.source_id?.message}
            />
          )}
        />
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
  modifierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addModifierText: {
    color: colors.buttonPrimary,
    fontWeight: '600',
  },
  removeButton: {
    color: colors.error,
    fontSize: 16,
    paddingHorizontal: 4,
  },
  bonusFieldContainer: {
    width: 90,
  },
});
