import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClassCreateSchema,
  type ClassCreateInput,
} from '@/features/classes/api/types';
import { createClass } from '@/features/classes/api/createClass';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';

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
      {submitError ? <Text style={{ color: 'red' }}>{submitError}</Text> : null}

      <View style={{ gap: 4 }}>
        <Text>Название</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Волшебник"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.name?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Английское название</Text>
        <Controller
          control={control}
          name="name_in_english"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Wizard"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.name_in_english?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Описание</Text>
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
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 8,
                borderRadius: 4,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />
          )}
        />
        <FormErrorText message={errors.description?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Основные характеристики</Text>
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
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.primary_modifiers?.message} />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '600' }}>Хиты</Text>

        <View style={{ gap: 4 }}>
          <Text>Кость хитов — количество</Text>
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
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.hits?.hit_dice?.count?.message} />
        </View>

        <View style={{ gap: 4 }}>
          <Text>Кость хитов — тип</Text>
          <Controller
            control={control}
            name="hits.hit_dice.dice_type"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="d6, d8, d10"
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.hits?.hit_dice?.dice_type?.message} />
        </View>

        <View style={{ gap: 4 }}>
          <Text>Стартовые хиты</Text>
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
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.hits?.starting_hits?.message} />
        </View>

        <View style={{ gap: 4 }}>
          <Text>Модификатор хитов</Text>
          <Controller
            control={control}
            name="hits.hit_modifier"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="constitution"
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.hits?.hit_modifier?.message} />
        </View>

        <View style={{ gap: 4 }}>
          <Text>Хиты за следующий уровень</Text>
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
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.hits?.next_level_hits?.message} />
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '600' }}>Профициенции</Text>

        <View style={{ gap: 4 }}>
          <Text>Спасброски</Text>
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
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.proficiencies?.saving_throws?.message} />
        </View>

        <View style={{ gap: 4 }}>
          <Text>Навыки</Text>
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
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.proficiencies?.skills?.message} />
        </View>

        <View style={{ gap: 4 }}>
          <Text>Количество навыков</Text>
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
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.proficiencies?.number_skills?.message} />
        </View>

        <View style={{ gap: 4 }}>
          <Text>Количество инструментов</Text>
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
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.proficiencies?.number_tools?.message} />
        </View>
      </View>

      <View style={{ gap: 4 }}>
        <Text>ID источника</Text>
        <Controller
          control={control}
          name="source_id"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="UUID источника"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.source_id?.message} />
      </View>

      <FormSubmitButton
        title="Сохранить класс"
        isSubmitting={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </FormScreenLayout>
  );
};
