import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createFeat } from '@/features/feats/api/createFeat';
import { FeatCreateSchema, type FeatCreateInput } from '@/features/feats/api/types';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { colors } from '@/shared/theme/colors';

interface FeatFormProps {
  onSuccess?: () => void;
}

const defaultValues: FeatCreateInput = {
  name: '',
  description: '',
  caster: false,
  required_armor_types: [],
  required_modifiers: [],
  increase_modifiers: [],
};

export const FeatForm: React.FC<FeatFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FeatCreateInput>({
    resolver: zodResolver(FeatCreateSchema),
    defaultValues,
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [rawRequiredArmors, setRawRequiredArmors] = React.useState('');
  const [requiredModifiersNames, setRequiredModifiersNames] = React.useState('');
  const [requiredMinValue, setRequiredMinValue] = React.useState('');
  const [increaseModifiers, setIncreaseModifiers] = React.useState('');

  const { mutateAsync } = useMutation({
    mutationFn: createFeat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feats'] });
    },
  });

  const onSubmit = async (values: FeatCreateInput) => {
    setSubmitError(null);
    const armorTypes = (rawRequiredArmors ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const modifiers = (requiredModifiersNames ?? '')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m) => ({ modifier: m, min_value: Number(requiredMinValue) || 0 }));

    const increased = (increaseModifiers ?? '')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    values.required_armor_types = armorTypes;
    values.required_modifiers = modifiers;
    values.increase_modifiers = increased;

    try {
      await mutateAsync(values);
      if (onSuccess) {
        onSuccess();
      } else {
        reset(defaultValues);
        setRawRequiredArmors('');
        setRequiredModifiersNames('');
        setRequiredMinValue('');
        setIncreaseModifiers('');
      }
    } catch (error) {
      console.error('Create feat error:', error);
      setSubmitError('Не удалось сохранить способность. Попробуйте ещё раз.');
    }
  };

  return (
    <FormScreenLayout title="Создать способность (feat)">
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
              placeholder="Двойной удар"
              style={styles.input}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.name?.message}</FormErrorText>
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
              placeholder="Опишите эффект способности"
              multiline
              style={[styles.input, styles.textArea]}
              placeholderTextColor={colors.inputPlaceholder}
            />
          )}
        />
        <FormErrorText>{errors.description?.message}</FormErrorText>
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Кастер</Text>
          <Controller
            control={control}
            name="caster"
            render={({ field: { value, onChange } }) => <Switch value={value} onValueChange={onChange} />}
          />
        </View>
        <FormErrorText>{errors.caster?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Требуемые типы брони (через запятую)</Text>
        <TextInput
          value={rawRequiredArmors}
          onChangeText={setRawRequiredArmors}
          placeholder="light, medium, heavy"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />
        <FormErrorText>{errors.required_armor_types?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Требуемые характеристики (через запятую)</Text>
        <TextInput
          value={requiredModifiersNames}
          onChangeText={setRequiredModifiersNames}
          placeholder="STR, DEX"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />
        <FormErrorText>{errors.required_modifiers?.message}</FormErrorText>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Минимальное значение характеристики</Text>
        <TextInput
          value={requiredMinValue}
          onChangeText={setRequiredMinValue}
          keyboardType="numeric"
          placeholder="13"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />
        <FormErrorText>{errors.required_modifiers?.message}</FormErrorText>
        {/* TODO: сделать полноценный редактор модификаторов */}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Увеличиваемые характеристики (через запятую)</Text>
        <TextInput
          value={increaseModifiers}
          onChangeText={setIncreaseModifiers}
          placeholder="STR, CHA"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />
        <FormErrorText>{errors.increase_modifiers?.message}</FormErrorText>
      </View>

      <FormSubmitButton
        title="Создать способность"
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
