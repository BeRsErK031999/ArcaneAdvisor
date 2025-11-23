import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SpellCreateSchema, type SpellCreateInput } from '@/features/spells/api/types';
import { createSpell } from '@/features/spells/api/createSpell';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';

interface SpellFormProps {
  onSuccess?: () => void;
}

const defaultValues: SpellCreateInput = SpellCreateSchema.parse({
  name: '',
  description: '',
  next_level_description: '',
  level: 1,
  school: '',
  casting_time: { count: 1, unit: 'action' },
  spell_range: { count: 60, unit: 'ft' },
  components: {
    verbal: false,
    symbolic: false,
    material: false,
    materials: [],
  },
});

export const SpellForm: React.FC<SpellFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SpellCreateInput>({
    resolver: zodResolver(SpellCreateSchema),
    defaultValues,
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: createSpell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spells'] });
    },
  });

  const onSubmit = async (values: SpellCreateInput) => {
    setSubmitError(null);
    try {
      await mutateAsync(values);
      if (onSuccess) {
        onSuccess();
      } else {
        reset(defaultValues);
      }
    } catch (error) {
      console.error('Create spell error:', error);
      setSubmitError('Не удалось сохранить заклинание. Попробуйте ещё раз.');
    }
  };

  return (
    <FormScreenLayout title="Создать заклинание">
      {submitError ? (
        <Text style={{ color: 'red' }}>{submitError}</Text>
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
              placeholder="Огненный шар"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.name?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Уровень</Text>
        <Controller
          control={control}
          name="level"
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
        <FormErrorText message={errors.level?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Школа</Text>
        <Controller
          control={control}
          name="school"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Эвокация"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
            />
          )}
        />
        <FormErrorText message={errors.school?.message} />
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
              placeholder="Опишите эффект заклинания"
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

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>Концентрация</Text>
          <Controller
            control={control}
            name="concentration"
            render={({ field: { value, onChange } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>
        <FormErrorText message={errors.concentration?.message} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>Ритуал</Text>
          <Controller
            control={control}
            name="ritual"
            render={({ field: { value, onChange } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>
        <FormErrorText message={errors.ritual?.message} />
      </View>

      <View style={{ gap: 4 }}>
        <Text>Время накладывания</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="casting_time.count"
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
            <FormErrorText message={errors.casting_time?.count?.message} />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="casting_time.unit"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="action"
                  style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
                />
              )}
            />
            <FormErrorText message={errors.casting_time?.unit?.message} />
          </View>
        </View>
      </View>

      <View style={{ gap: 4 }}>
        <Text>Дистанция</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="spell_range.count"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value?.toString() ?? ''}
                  onChangeText={(text) => onChange(Number(text))}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  placeholder="60"
                  style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
                />
              )}
            />
            <FormErrorText message={errors.spell_range?.count?.message} />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="spell_range.unit"
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
            <FormErrorText message={errors.spell_range?.unit?.message} />
          </View>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text>Компоненты</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>Вербальный</Text>
          <Controller
            control={control}
            name="components.verbal"
            render={({ field: { value, onChange } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>
        <FormErrorText message={errors.components?.verbal?.message} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>Соматический</Text>
          <Controller
            control={control}
            name="components.symbolic"
            render={({ field: { value, onChange } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>
        <FormErrorText message={errors.components?.symbolic?.message} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>Материальный</Text>
          <Controller
            control={control}
            name="components.material"
            render={({ field: { value, onChange } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>
        <FormErrorText message={errors.components?.material?.message} />

        <View style={{ gap: 4 }}>
          <Text>Материалы (через запятую)</Text>
          <Controller
            control={control}
            name="components.materials"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value.join(', ')}
                onChangeText={(text) =>
                  onChange(
                    text
                      .split(',')
                      .map((item) => item.trim())
                      .filter((item) => item.length > 0),
                  )
                }
                onBlur={onBlur}
                placeholder="перо, песок"
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
              />
            )}
          />
          <FormErrorText message={errors.components?.materials?.message} />
        </View>
      </View>

      <FormSubmitButton
        title="Сохранить заклинание"
        isSubmitting={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </FormScreenLayout>
  );
};
