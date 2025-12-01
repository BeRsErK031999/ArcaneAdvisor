import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createSubrace } from '@/features/subraces/api/createSubrace';
import { updateSubrace } from '@/features/subraces/api/updateSubrace';
import { SubraceCreateSchema, type SubraceCreateInput } from '@/features/subraces/api/types';
import { getRaces } from '@/features/races/api/getRaces';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { SelectField, type SelectOption } from '@/shared/forms/SelectField';
import { BackButton } from '@/shared/ui/BackButton';
import { colors } from '@/shared/theme/colors';

export type SubraceFormMode = 'create' | 'edit';

interface SubraceFormProps {
  mode?: SubraceFormMode;
  subraceId?: string;
  initialValues?: SubraceCreateInput;
  onSuccess?: () => void;
  submitLabel?: string;
}

const ABILITY_OPTIONS: SelectOption[] = [
  { value: 'strength', label: 'Сила (STR)' },
  { value: 'dexterity', label: 'Ловкость (DEX)' },
  { value: 'constitution', label: 'Телосложение (CON)' },
  { value: 'intelligence', label: 'Интеллект (INT)' },
  { value: 'wisdom', label: 'Мудрость (WIS)' },
  { value: 'charisma', label: 'Харизма (CHA)' },
];

const defaultSubraceValues: SubraceCreateInput = {
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
  const formDefaultValues = initialValues ?? defaultSubraceValues;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubraceCreateInput>({
    resolver: zodResolver(SubraceCreateSchema),
    defaultValues: formDefaultValues,
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const { data: races, isLoading: isRacesLoading } = useQuery({
    queryKey: ['races'],
    queryFn: getRaces,
  });

  const raceOptions: SelectOption[] = React.useMemo(
    () =>
      races
        ? races.map((race) => ({
            value: race.race_id,
            label: race.name,
          }))
        : [],
    [races],
  );

  const abilityOptionsWithCustom = React.useMemo<SelectOption[]>(
    () => [...ABILITY_OPTIONS, { value: 'custom', label: 'Другая характеристика' }],
    [],
  );

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subraces'] });
      if (subraceId) {
        queryClient.invalidateQueries({ queryKey: ['subraces', subraceId] });
      }
      if (variables.race_id) {
        queryClient.invalidateQueries({ queryKey: ['races', variables.race_id] });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: SubraceCreateInput) => {
    setSubmitError(null);

    try {
      if (mode === 'edit') {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
        reset(defaultSubraceValues);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Subrace form submit error:', error);
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
    <FormScreenLayout title={title} leftAction={<BackButton />}>
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      <View style={styles.field}>
        <Text style={styles.label}>Раса</Text>
        <Controller
          control={control}
          name="race_id"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Раса"
              placeholder="Выберите родительскую расу"
              value={value}
              onChange={onChange}
              options={raceOptions}
              isLoading={isRacesLoading}
              errorMessage={errors.race_id?.message}
            />
          )}
        />
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Бонусы к характеристикам</Text>
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
              onChange([...rows, { modifier: ABILITY_OPTIONS[0].value, bonus: 0 }]);
            };

            const handleRemoveRow = (index: number) => {
              const next = rows.filter((_, i) => i !== index);
              onChange(next);
            };

            const isCustomModifier = (modifier: string | undefined) =>
              !ABILITY_OPTIONS.some((option) => option.value === modifier);

            return (
              <View style={{ gap: 8 }}>
                {rows.map((row, index) => {
                  const selectValue = isCustomModifier(row?.modifier) ? 'custom' : row?.modifier;

                  return (
                    <View key={index} style={styles.modifierRow}>
                      <View style={{ flex: 1 }}>
                        <SelectField
                          label={`Характеристика ${index + 1}`}
                          placeholder="Выберите характеристику"
                          value={selectValue}
                          onChange={(modifier) =>
                            handleChangeRow(index, { modifier: modifier === 'custom' ? '' : modifier })
                          }
                          options={abilityOptionsWithCustom}
                          errorMessage={errors.increase_modifiers?.[index]?.modifier?.message}
                        />
                        {selectValue === 'custom' ? (
                          <TextInput
                            value={row?.modifier ?? ''}
                            onChangeText={(text) => handleChangeRow(index, { modifier: text })}
                            placeholder="Введите свою характеристику"
                            style={[styles.input, { marginTop: 6 }]}
                            placeholderTextColor={colors.inputPlaceholder}
                          />
                        ) : null}
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
                        <FormErrorText>{errors.increase_modifiers?.[index]?.bonus?.message}</FormErrorText>
                      </View>

                      <TouchableOpacity onPress={() => handleRemoveRow(index)}>
                        <Text style={styles.removeButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <TouchableOpacity onPress={handleAddRow}>
                  <Text style={styles.addModifierText}>+ Добавить модификатор</Text>
                </TouchableOpacity>

                <FormErrorText>{errors.increase_modifiers?.message}</FormErrorText>
              </View>
            );
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Особенности</Text>
        <Controller
          control={control}
          name="features"
          render={({ field: { value, onChange } }) => {
            const rows = value ?? [];

            const handleChangeRow = (index: number, patch: Partial<(typeof rows)[number]>) => {
              const next = [...rows];
              next[index] = { ...next[index], ...patch };
              onChange(next);
            };

            const handleAddRow = () => {
              onChange([...rows, { name: '', description: '' }]);
            };

            const handleRemoveRow = (index: number) => {
              const next = rows.filter((_, i) => i !== index);
              onChange(next);
            };

            return (
              <View style={{ gap: 12 }}>
                {rows.map((row, index) => (
                  <View key={index} style={styles.featureCard}>
                    <View style={styles.field}>
                      <Text style={styles.label}>Название особенности</Text>
                      <TextInput
                        value={row?.name}
                        onChangeText={(text) => handleChangeRow(index, { name: text })}
                        placeholder="Например, Тёмное зрение"
                        style={styles.input}
                        placeholderTextColor={colors.inputPlaceholder}
                      />
                      <FormErrorText>{errors.features?.[index]?.name?.message}</FormErrorText>
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.label}>Описание</Text>
                      <TextInput
                        value={row?.description}
                        onChangeText={(text) => handleChangeRow(index, { description: text })}
                        placeholder="Опишите особенность"
                        multiline
                        style={[styles.input, styles.textArea]}
                        placeholderTextColor={colors.inputPlaceholder}
                      />
                      <FormErrorText>{errors.features?.[index]?.description?.message}</FormErrorText>
                    </View>

                    <TouchableOpacity onPress={() => handleRemoveRow(index)} style={styles.featureRemoveButton}>
                      <Text style={styles.removeButton}>Удалить</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity onPress={handleAddRow}>
                  <Text style={styles.addModifierText}>+ Добавить особенность</Text>
                </TouchableOpacity>

                <FormErrorText>{errors.features?.message}</FormErrorText>
              </View>
            );
          }}
        />
      </View>

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
    gap: 4,
  },
  featureCard: {
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
  },
  featureRemoveButton: {
    alignSelf: 'flex-end',
  },
});
