import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClassCreateSchema,
  type ClassCreateInput,
} from '@/features/classes/api/types';
import { createClass } from '@/features/classes/api/createClass';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';

interface ClassFormProps {
  onSuccess?: () => void;
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

export const ClassForm: React.FC<ClassFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClassCreateInput>({
    resolver: zodResolver(ClassCreateSchema),
    defaultValues,
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const onSubmit = async (values: ClassCreateInput) => {
    setSubmitError(null);
    try {
      await mutateAsync(values);
      if (onSuccess) {
        onSuccess();
      } else {
        reset(defaultValues);
      }
    } catch (error) {
      console.error('Create class error:', error);
      setSubmitError('Не удалось сохранить класс. Попробуйте ещё раз.');
    }
  };

  return (
    <FormScreenLayout title="Создать класс">
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
        <Text style={styles.label}>Основные характеристики</Text>
        <Controller
          control={control}
          name="primary_modifiers"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value.join(', ')}
              onChangeText={(text) =>
                onChange(
                  text
                    .split(',')
                    .map((mod) => mod.trim())
                  .filter(Boolean),
              )
              }
              onBlur={onBlur}
              placeholder="strength, charisma"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.primary_modifiers?.message}</FormErrorText>
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
                onChangeText={(text) => onChange(Number(text))}
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
          <Text style={styles.label}>Кость хитов — тип</Text>
          <Controller
            control={control}
            name="hits.hit_dice.dice_type"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="d6, d8, d10"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.hits?.hit_dice?.dice_type?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Стартовые хиты</Text>
          <Controller
            control={control}
            name="hits.starting_hits"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value?.toString() ?? ''}
                onChangeText={(text) => onChange(Number(text))}
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
          <Text style={styles.label}>Модификатор хитов</Text>
          <Controller
            control={control}
            name="hits.hit_modifier"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="constitution"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.hits?.hit_modifier?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Хиты за следующий уровень</Text>
          <Controller
            control={control}
            name="hits.next_level_hits"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value?.toString() ?? ''}
                onChangeText={(text) => onChange(Number(text))}
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
          <Text style={styles.label}>Спасброски</Text>
          <Controller
            control={control}
            name="proficiencies.saving_throws"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value.join(', ')}
                onChangeText={(text) =>
                  onChange(
                    text
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
                onBlur={onBlur}
                placeholder="strength, constitution"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.proficiencies?.saving_throws?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Навыки</Text>
          <Controller
            control={control}
            name="proficiencies.skills"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value.join(', ')}
                onChangeText={(text) =>
                  onChange(
                    text
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
                onBlur={onBlur}
                placeholder="history, arcana"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.proficiencies?.skills?.message}</FormErrorText>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Количество навыков</Text>
          <Controller
            control={control}
            name="proficiencies.number_skills"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value?.toString() ?? ''}
                onChangeText={(text) => onChange(Number(text))}
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
                onChangeText={(text) => onChange(Number(text))}
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
        <Text style={styles.label}>ID источника</Text>
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

      <FormSubmitButton
        title="Сохранить класс"
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
