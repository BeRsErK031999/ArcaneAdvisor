import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createSubclass } from '@/features/subclasses/api/createSubclass';
import { updateSubclass } from '@/features/subclasses/api/updateSubclass';
import { SubclassCreateSchema, type SubclassCreateInput } from '@/features/subclasses/api/types';
import { getClasses } from '@/features/classes/api/getClasses';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { SelectField, type SelectOption } from '@/shared/forms/SelectField';
import { colors } from '@/shared/theme/colors';

type SubclassFormMode = 'create' | 'edit';

interface SubclassFormProps {
  mode?: SubclassFormMode;
  subclassId?: string;
  initialValues?: SubclassCreateInput;
  onSuccess?: () => void;
  submitLabel?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const defaultValues: SubclassCreateInput = {
  class_id: '',
  name: '',
  description: '',
  name_in_english: '',
};

export const SubclassForm: React.FC<SubclassFormProps> = ({
  mode = 'create',
  subclassId,
  initialValues,
  onSuccess,
  submitLabel,
  showBackButton,
  onBackPress,
}) => {
  const queryClient = useQueryClient();

  const { data: classes, isLoading: isClassesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  const classOptions = React.useMemo<SelectOption[]>(
    () =>
      (classes ?? []).map((classItem) => ({
        value: classItem.class_id,
        label: classItem.name,
      })),
    [classes],
  );

  const formDefaultValues = initialValues ?? defaultValues;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubclassCreateInput>({
    resolver: zodResolver(SubclassCreateSchema),
    defaultValues: formDefaultValues,
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createSubclass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subclasses'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: SubclassCreateInput) => {
      if (!subclassId) throw new Error('subclassId is required for update');
      return updateSubclass(subclassId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subclasses'] });
      if (subclassId) {
        queryClient.invalidateQueries({ queryKey: ['subclasses', subclassId] });
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: SubclassCreateInput) => {
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
      console.error('Failed to submit subclass form:', error);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить изменения подкласса. Попробуйте ещё раз.'
          : 'Не удалось создать подкласс. Попробуйте ещё раз.',
      );
    }
  };

  const finalSubmitLabel = submitLabel ?? (mode === 'edit' ? 'Сохранить изменения' : 'Создать подкласс');
  const formTitle = mode === 'edit' ? 'Редактировать подкласс' : 'Создать подкласс';

  return (
    <FormScreenLayout
      title={formTitle}
      showBackButton={showBackButton}
      onBackPress={onBackPress}
    >
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      <View style={styles.field}>
        <Controller
          control={control}
          name="class_id"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Класс"
              placeholder="Выберите класс"
              value={value || null}
              onChange={onChange}
              options={classOptions}
              isLoading={isClassesLoading}
              errorMessage={errors.class_id?.message}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Название подкласса</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Рыцарь теней"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.name?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Название на английском</Text>
        <Controller
          control={control}
          name="name_in_english"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Shadow Knight"
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
              placeholder="Кратко опишите особенности подкласса"
              multiline
              style={[styles.input, styles.textArea]}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.description?.message}</FormErrorText>
      </View>

      <FormSubmitButton title={finalSubmitLabel} isSubmitting={isSubmitting} onPress={handleSubmit(onSubmit)} />
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
});
