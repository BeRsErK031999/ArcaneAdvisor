import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSubrace } from '@/features/subraces/api/createSubrace';
import { SubraceCreateSchema, type SubraceCreateInput } from '@/features/subraces/api/types';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';

interface SubraceFormProps {
  onSuccess?: () => void;
}

const defaultValues: SubraceCreateInput = {
  race_id: '',
  name: '',
  description: '',
  increase_modifiers: [],
  name_in_english: '',
  features: [],
};

export const SubraceForm: React.FC<SubraceFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SubraceCreateInput>({
    resolver: zodResolver(SubraceCreateSchema),
    defaultValues,
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [abilityBonuses, setAbilityBonuses] = React.useState('');

  const { mutateAsync } = useMutation({
    mutationFn: createSubrace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subraces'] });
    },
  });

  const onSubmit = async (values: SubraceCreateInput) => {
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

          return { modifier, bonus } as SubraceCreateInput['increase_modifiers'][number];
        })
        .filter(Boolean) as SubraceCreateInput['increase_modifiers'];

      const payload: SubraceCreateInput = {
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
      console.error('Failed to create subrace', e);
      setSubmitError('Не удалось сохранить подрасу. Попробуйте ещё раз.');
    }
  };

  return (
    <FormScreenLayout title="Создать подрасу">
      {submitError ? (
        <Text style={{ color: 'red', marginBottom: 8 }}>{submitError}</Text>
      ) : null}

      <View style={{ gap: 4 }}>
        <Text>UUID расы</Text>
        <Controller
          control={control}
          name="race_id"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="00000000-0000-0000-0000-000000000000"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.race_id?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Название подрасы</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Лесной эльф"
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
              placeholder="Wood Elf"
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
              placeholder="Опишите подрасу"
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
        <Text>Бонусы к характеристикам (через запятую)</Text>
        <TextInput
          value={abilityBonuses}
          onChangeText={setAbilityBonuses}
          placeholder="DEX:+2, CHA:+1"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
        />
        <Text style={{ fontSize: 12, color: '#555' }}>
          Введите бонусы в формате MOD:+N. Поле необязательно.
        </Text>
      </View>

      <FormSubmitButton
        title="Сохранить подрасу"
        isSubmitting={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </FormScreenLayout>
  );
};
