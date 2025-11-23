import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RaceCreateSchema,
  type RaceCreateInput,
} from '@/features/races/api/types';
import { createRace } from '@/features/races/api/createRace';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';

interface RaceFormProps {
  onSuccess?: () => void;
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
  source_id: '00000000-0000-0000-0000-000000000000',
  features: [],
  name_in_english: '',
};

export const RaceForm: React.FC<RaceFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RaceCreateInput>({
    resolver: zodResolver(RaceCreateSchema),
    defaultValues,
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [abilityBonuses, setAbilityBonuses] = React.useState('');

  const { mutateAsync } = useMutation({
    mutationFn: createRace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] });
    },
  });

  const onSubmit = async (values: RaceCreateInput) => {
    try {
      setSubmitError(null);
      const parsedModifiers = abilityBonuses
        .split(',')
        .map((raw) => {
          const [modifier, bonusRaw] = raw.split(':').map((item) => item.trim());
          const bonus = Number.parseInt(bonusRaw ?? '', 10);

          if (!modifier || Number.isNaN(bonus)) {
            return null;
          }

          return { modifier, bonus };
        })
        .filter(Boolean) as RaceCreateInput['increase_modifiers'];

      const payload: RaceCreateInput = {
        ...values,
        increase_modifiers: parsedModifiers,
      };

      await mutateAsync(payload);
      if (onSuccess) {
        onSuccess();
      } else {
        reset(defaultValues);
        setAbilityBonuses('');
      }
    } catch (e) {
      console.error('Failed to create race', e);
      setSubmitError('Не удалось сохранить расу. Попробуйте ещё раз.');
    }
  };

  return (
    <FormScreenLayout title="Создать расу">
      {submitError ? (
        <Text style={{ color: 'red', marginBottom: 8 }}>{submitError}</Text>
      ) : null}

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
              placeholder="Гном"
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
              placeholder="Dwarf"
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
              placeholder="Опишите расу"
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
        <Text>Тип существа</Text>
        <Controller
          control={control}
          name="creature_type"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="humanoid"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.creature_type?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Размер</Text>
        <Controller
          control={control}
          name="creature_size"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="medium"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.creature_size?.message} />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '600' }}>Скорость</Text>

        <View style={{ gap: 4 }}>
          <Text>Базовая скорость</Text>
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
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.speed?.base_speed?.count?.message} />
        </View>

        <View style={{ gap: 4 }}>
          <Text>Единица измерения</Text>
          <Controller
            control={control}
            name="speed.base_speed.unit"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="ft"
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.speed?.base_speed?.unit?.message} />
        </View>

        <View style={{ gap: 4 }}>
          <Text>Описание скорости</Text>
          <Controller
            control={control}
            name="speed.description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Базовая скорость пешком"
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.speed?.description?.message} />
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '600' }}>Возраст</Text>

        <View style={{ gap: 4 }}>
          <Text>Максимальный возраст</Text>
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
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.age?.max_age?.message} />
        </View>

        <View style={{ gap: 4 }}>
          <Text>Описание возраста</Text>
          <Controller
            control={control}
            name="age.description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Средняя продолжительность жизни"
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.age?.description?.message} />
        </View>
      </View>

      <View style={{ gap: 4 }}>
        <Text>Модификаторы характеристик</Text>
        <Text style={{ color: '#555', fontSize: 12 }}>
          strength:+2, charisma:+1
        </Text>
        <TextInput
          value={abilityBonuses}
          onChangeText={setAbilityBonuses}
          placeholder="strength:+2, charisma:+1"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
        />
        {/* TODO: parse ability bonuses from text with better UX */}
        <FormErrorText message={errors.increase_modifiers?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Источник</Text>
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

      {/* TODO: добавить форму для особенностей */}

      <FormSubmitButton
        title="Сохранить расу"
        isSubmitting={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </FormScreenLayout>
  );
};
