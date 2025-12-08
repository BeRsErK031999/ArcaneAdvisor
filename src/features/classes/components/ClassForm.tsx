import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClassCreateSchema,
  type ClassCreateInput,
} from '@/features/classes/api/types';
import { createClass } from '@/features/classes/api/createClass';
import { updateClass } from '@/features/classes/api/updateClass';
import { getDiceTypes } from '@/features/dictionaries/api/getDiceTypes';
import { getSkills } from '@/features/dictionaries/api/getSkills';
import { getModifiers } from '@/features/dictionaries/api/getModifiers';
import { getSources } from '@/features/sources/api/getSources';
import { getWeapons } from '@/features/weapons/api/getWeapons';
import { getTools } from '@/features/tools/api/getTools';
import { SelectField, type SelectOption } from '@/shared/forms/SelectField';
import { MultiSelectField } from '@/shared/forms/MultiSelectField';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';

type ClassFormMode = 'create' | 'edit';

interface ClassFormProps {
  mode?: ClassFormMode;
  classId?: string;
  initialValues?: ClassCreateInput;
  onSuccess?: () => void;
  submitLabel?: string;
}

const defaultValues: ClassCreateInput = {
  name: '',
  description: '',
  primary_modifiers: [],
  hits: {
    hit_dice: { count: 1, dice_type: 'd8' },
    starting_hits: 8,
    hit_modifier: 'constitution',
    next_level_hits: 5,
  },
  proficiencies: {
    armors: [],
    weapons: [],
    tools: [],
    saving_throws: [],
    skills: [],
    number_skills: 2,
    number_tools: 0,
  },
  name_in_english: '',
  source_id: '',
};

const MODIFIER_CODE_MAP: Record<string, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intellect: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
};

export const ClassForm: React.FC<ClassFormProps> = ({
  mode = 'create',
  classId,
  initialValues,
  onSuccess,
  submitLabel,
}) => {
  const queryClient = useQueryClient();
  const formDefaultValues = initialValues ?? defaultValues;

  const { control, handleSubmit, formState, reset } = useForm<ClassCreateInput>({
    resolver: zodResolver(ClassCreateSchema),
    defaultValues: formDefaultValues,
  });

  const { errors } = formState;
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const createMutation = useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: ClassCreateInput) => {
      if (!classId) {
        throw new Error('classId is required for update');
      }
      return updateClass(classId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      if (classId) {
        queryClient.invalidateQueries({ queryKey: ['classes', classId] });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const { data: diceTypesDict, isLoading: isDiceTypesLoading } = useQuery({
    queryKey: ['dice-types'],
    queryFn: getDiceTypes,
  });

  const { data: modifiersDict, isLoading: isModifiersLoading } = useQuery({
    queryKey: ['modifiers'],
    queryFn: getModifiers,
  });

  const { data: skillsDict, isLoading: isSkillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: getSkills,
  });

  const { data: sources, isLoading: isSourcesLoading } = useQuery({
    queryKey: ['sources'],
    queryFn: getSources,
  });

  const { data: weapons, isLoading: isWeaponsLoading } = useQuery({
    queryKey: ['weapons'],
    queryFn: getWeapons,
  });

  const { data: tools, isLoading: isToolsLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: getTools,
  });

  const abilityOptions: SelectOption[] = React.useMemo(
    () =>
      modifiersDict
        ? Object.entries(modifiersDict).map(([key, russianName]) => {
            const code = MODIFIER_CODE_MAP[key] ?? key.toUpperCase();
            const capitalized = russianName.charAt(0).toUpperCase() + russianName.slice(1);
            return {
              value: key,
              label: `${capitalized} (${code})`,
            };
          })
        : [],
    [modifiersDict],
  );

  const diceTypeOptions: SelectOption[] = React.useMemo(
    () =>
      diceTypesDict
        ? Object.keys(diceTypesDict).map((key) => ({
            value: key,
            label: diceTypesDict[key] ? `${key} — ${diceTypesDict[key]}` : key,
          }))
        : [],
    [diceTypesDict],
  );

  const skillOptions: SelectOption[] = React.useMemo(
    () =>
      skillsDict
        ? Object.entries(skillsDict).map(([key, skillName]) => ({
            value: key,
            label: skillName,
          }))
        : [],
    [skillsDict],
  );

  const sourceOptions: SelectOption[] = React.useMemo(
    () =>
      sources
        ? sources.map((source) => ({
            value: source.source_id,
            label: source.name,
          }))
        : [],
    [sources],
  );

  const weaponOptions: SelectOption[] = React.useMemo(
    () =>
      weapons
        ? weapons.map((weapon) => ({
            value: weapon.weapon_id,
            label: weapon.name,
          }))
        : [],
    [weapons],
  );

  const toolOptions: SelectOption[] = React.useMemo(
    () =>
      tools
        ? tools.map((tool) => ({
            value: tool.tool_id,
            label: tool.name,
          }))
        : [],
    [tools],
  );

  const [formTitle, finalSubmitLabel] = React.useMemo(
    () => [
      mode === 'edit' ? 'Редактировать класс' : 'Создать класс',
      submitLabel ?? (mode === 'edit' ? 'Сохранить изменения' : 'Сохранить класс'),
    ],
    [mode, submitLabel],
  );

  const onSubmit = async (values: ClassCreateInput) => {
    setSubmitError(null);
    try {
      if (mode === 'edit') {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
        reset();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Class form submit error:', error);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить изменения класса. Попробуйте ещё раз.'
          : 'Не удалось сохранить класс. Попробуйте ещё раз.',
      );
    }
  };

  return (
    <FormScreenLayout title={formTitle}>
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
              placeholder="Волшебник"
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
              placeholder="Wizard"
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
              placeholder="Опишите класс"
              multiline
              style={[styles.input, styles.textArea]}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.description?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Controller
          control={control}
          name="primary_modifiers"
          render={({ field: { value, onChange } }) => (
            <MultiSelectField
              label="Основные характеристики"
              placeholder="Выберите одну или несколько характеристик"
              values={value}
              onChange={onChange}
              options={abilityOptions}
              isLoading={isModifiersLoading}
              errorMessage={errors.primary_modifiers?.message}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Хиты</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Кость хитов — количество</Text>
          <Controller
            control={control}
            name="hits.hit_dice.count"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value?.toString() ?? ''}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  const numeric = Number(numericText);
                  onChange(Number.isNaN(numeric) ? 0 : numeric);
                }}
                onBlur={onBlur}
                keyboardType="numeric"
                placeholder="1"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.hits?.hit_dice?.count?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="hits.hit_dice.dice_type"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Кость хитов"
                placeholder="Выберите тип кости (d6, d8, d10...)"
                value={value}
                onChange={onChange}
                options={diceTypeOptions}
                isLoading={isDiceTypesLoading}
                errorMessage={errors.hits?.hit_dice?.dice_type?.message}
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Стартовые хиты</Text>
          <Controller
            control={control}
            name="hits.starting_hits"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value?.toString() ?? ''}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  const numeric = Number(numericText);
                  onChange(Number.isNaN(numeric) ? 0 : numeric);
                }}
                onBlur={onBlur}
                keyboardType="numeric"
                placeholder="8"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.hits?.starting_hits?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="hits.hit_modifier"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Модификатор хитов"
                placeholder="Выберите характеристику"
                value={value}
                onChange={onChange}
                options={abilityOptions}
                isLoading={isModifiersLoading}
                errorMessage={errors.hits?.hit_modifier?.message}
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Хиты за следующий уровень</Text>
          <Controller
            control={control}
            name="hits.next_level_hits"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value?.toString() ?? ''}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  const numeric = Number(numericText);
                  onChange(Number.isNaN(numeric) ? 0 : numeric);
                }}
                onBlur={onBlur}
                keyboardType="numeric"
                placeholder="5"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.hits?.next_level_hits?.message}</FormErrorText>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Профициенции</Text>

        <View style={styles.field}>
          <Controller
            control={control}
            name="proficiencies.saving_throws"
            render={({ field: { value, onChange } }) => (
              <MultiSelectField
                label="Спасброски"
                placeholder="Выберите характеристики спасбросков"
                values={value}
                onChange={onChange}
                options={abilityOptions}
                isLoading={isModifiersLoading}
                errorMessage={errors.proficiencies?.saving_throws?.message}
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="proficiencies.skills"
            render={({ field: { value, onChange } }) => (
              <MultiSelectField
                label="Навыки"
                placeholder="Выберите доступные навыки"
                values={value}
                onChange={onChange}
                options={skillOptions}
                isLoading={isSkillsLoading}
                errorMessage={errors.proficiencies?.skills?.message}
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="proficiencies.weapons"
            render={({ field: { value, onChange } }) => (
              <MultiSelectField
                label="Оружие"
                placeholder="Выберите профициенции по оружию"
                values={value}
                onChange={onChange}
                options={weaponOptions}
                isLoading={isWeaponsLoading}
                errorMessage={
                  errors.proficiencies?.weapons?.message as string | undefined
                }
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="proficiencies.tools"
            render={({ field: { value, onChange } }) => (
              <MultiSelectField
                label="Инструменты"
                placeholder="Выберите профициенции по инструментам"
                values={value}
                onChange={onChange}
                options={toolOptions}
                isLoading={isToolsLoading}
                errorMessage={errors.proficiencies?.tools?.message as string | undefined}
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Количество навыков</Text>
          <Controller
            control={control}
            name="proficiencies.number_skills"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value?.toString() ?? ''}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  const numeric = Number(numericText);
                  onChange(Number.isNaN(numeric) ? 0 : numeric);
                }}
                onBlur={onBlur}
                keyboardType="numeric"
                placeholder="2"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.proficiencies?.number_skills?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Количество инструментов</Text>
          <Controller
            control={control}
            name="proficiencies.number_tools"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value?.toString() ?? ''}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  const numeric = Number(numericText);
                  onChange(Number.isNaN(numeric) ? 0 : numeric);
                }}
                onBlur={onBlur}
                keyboardType="numeric"
                placeholder="0"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.proficiencies?.number_tools?.message}</FormErrorText>
        </View>
      </View>

      <View style={styles.field}>
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

      <FormSubmitButton
        title={finalSubmitLabel}
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
});
