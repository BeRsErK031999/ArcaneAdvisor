import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSubclass } from '@/features/subclasses/api/createSubclass';
import { SubclassCreateSchema, type SubclassCreateInput } from '@/features/subclasses/api/types';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';

interface SubclassFormProps {
  onSuccess?: () => void;
}

const defaultValues: SubclassCreateInput = {
  class_id: '',
  name: '',
  description: '',
  name_in_english: '',
};

export const SubclassForm: React.FC<SubclassFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SubclassCreateInput>({
    resolver: zodResolver(SubclassCreateSchema),
    defaultValues,
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: createSubclass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subclasses'] });
    },
  });

  const onSubmit = async (values: SubclassCreateInput) => {
    setSubmitError(null);
    try {
      await mutateAsync(values);
      if (onSuccess) {
        onSuccess();
      } else {
        reset(defaultValues);
      }
    } catch (error) {
      console.error('Failed to create subclass:', error);
      setSubmitError('Не удалось создать подкласс. Попробуйте ещё раз.');
    }
  };

  return (
    <FormScreenLayout title="Создать подкласс">
      {submitError ? <Text style={{ color: 'red' }}>{submitError}</Text> : null}

      <View style={{ gap: 4 }}>
        <Text>UUID класса</Text>
        <Controller
          control={control}
          name="class_id"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="c7b15d1c-1234-4c3e-8f9e-abcdef012345"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.class_id?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Название подкласса</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Рыцарь теней"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.name?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Название на английском</Text>
        <Controller
          control={control}
          name="name_in_english"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Shadow Knight"
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
              placeholder="Кратко опишите особенности подкласса"
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

      <FormSubmitButton
        title="Создать подкласс"
        isSubmitting={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </FormScreenLayout>
  );
};
