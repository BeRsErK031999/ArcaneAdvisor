import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { createArmor } from '@/features/armors/api/createArmor';
import { updateArmor } from '@/features/armors/api/updateArmor';
import {
  ArmorCreateSchema,
  type ArmorCreateInput,
} from '@/features/armors/api/types';
import { colors } from '@/shared/theme/colors';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { BodyText } from '@/shared/ui/Typography';
import { getPieceTypes } from '@/features/dictionaries/api/getPieceTypes';
import { getWeightUnits } from '@/features/dictionaries/api/getWeightUnits';
import { getModifiers } from '@/features/dictionaries/api/getModifiers';
import { SelectField, type SelectOption } from '@/shared/forms/SelectField';
import { getMaterials } from '@/features/materials/api/getMaterials';
import type { Material } from '@/features/materials/api/types';
import { getArmorTypes, type ArmorTypeOption } from '@/features/armors/api/getArmorTypes';

interface ArmorFormProps {
  mode?: 'create' | 'edit';
  armorId?: string;
  initialValues?: ArmorCreateInput;
  onSuccess?: (armorId: string) => void;
  showBackButton?: boolean;
}

const defaultValues: ArmorCreateInput = {
  armor_type: '',
  name: '',
  description: '',
  armor_class: {
    base_class: 10,
    modifier: null,
    max_modifier_bonus: null,
  },
  strength: 0,
  stealth: false,
  weight: null,
  cost: null,
  material_id: null,
};

export function ArmorForm({
  mode = 'create',
  armorId,
  initialValues,
  onSuccess,
  showBackButton = true,
}: ArmorFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formDefaultValues = initialValues ?? defaultValues;

  const [hasWeight, setHasWeight] = React.useState(Boolean(formDefaultValues.weight));
  const [hasCost, setHasCost] = React.useState(Boolean(formDefaultValues.cost));

  const stringifyNumber = (value: number | null | undefined) =>
    value === undefined || value === null ? '' : String(value);

  const [baseClassInput, setBaseClassInput] = React.useState<string>(
    stringifyNumber(formDefaultValues.armor_class.base_class),
  );
  const [maxModifierBonusInput, setMaxModifierBonusInput] = React.useState<string>(
    stringifyNumber(formDefaultValues.armor_class.max_modifier_bonus),
  );
  const [strengthInput, setStrengthInput] = React.useState<string>(
    stringifyNumber(formDefaultValues.strength),
  );
  const [weightCountInput, setWeightCountInput] = React.useState<string>(
    stringifyNumber(formDefaultValues.weight?.count),
  );
  const [costCountInput, setCostCountInput] = React.useState<string>(
    stringifyNumber(formDefaultValues.cost?.count),
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<ArmorCreateInput>({
    resolver: zodResolver(ArmorCreateSchema),
    defaultValues: formDefaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  React.useEffect(() => {
    const nextValues = initialValues ?? defaultValues;
    reset(nextValues);
    setHasWeight(Boolean(nextValues.weight));
    setHasCost(Boolean(nextValues.cost));
    setBaseClassInput(stringifyNumber(nextValues.armor_class.base_class));
    setMaxModifierBonusInput(stringifyNumber(nextValues.armor_class.max_modifier_bonus));
    setStrengthInput(stringifyNumber(nextValues.strength));
    setWeightCountInput(stringifyNumber(nextValues.weight?.count));
    setCostCountInput(stringifyNumber(nextValues.cost?.count));
  }, [initialValues, reset]);

  const { data: pieceTypes, isLoading: isLoadingPieceTypes, isError: isErrorPieceTypes, refetch: refetchPieceTypes } =
    useQuery<Record<string, string>, Error>({
      queryKey: ['piece-types'],
      queryFn: getPieceTypes,
    });

  const { data: weightUnits, isLoading: isLoadingWeightUnits, isError: isErrorWeightUnits, refetch: refetchWeightUnits } =
    useQuery<Record<string, string>, Error>({
      queryKey: ['weight-units'],
      queryFn: getWeightUnits,
    });

  const { data: modifiers, isLoading: isLoadingModifiers, isError: isErrorModifiers, refetch: refetchModifiers } =
    useQuery<Record<string, string>, Error>({
      queryKey: ['modifiers'],
      queryFn: getModifiers,
    });

  const { data: materials, isLoading: isLoadingMaterials, isError: isErrorMaterials, refetch: refetchMaterials } =
    useQuery<Material[], Error>({
      queryKey: ['materials'],
      queryFn: getMaterials,
    });

  const { data: armorTypes, isLoading: isLoadingArmorTypes, isError: isErrorArmorTypes, refetch: refetchArmorTypes } =
    useQuery<ArmorTypeOption[], Error>({
      queryKey: ['armor-types'],
      queryFn: getArmorTypes,
    });

  const pieceTypeOptions: SelectOption[] = React.useMemo(
    () =>
      pieceTypes
        ? Object.entries(pieceTypes).map(([key, label]) => ({ value: key, label: label || key }))
        : [],
    [pieceTypes],
  );

  const weightUnitOptions: SelectOption[] = React.useMemo(
    () =>
      weightUnits
        ? Object.entries(weightUnits).map(([key, label]) => ({ value: key, label: label || key }))
        : [],
    [weightUnits],
  );

  const modifierOptions: SelectOption[] = React.useMemo(
    () =>
      modifiers
        ? [{ value: '', label: 'Без модификатора' }].concat(
            Object.entries(modifiers).map(([key, label]) => ({ value: key, label: label || key })),
          )
        : [{ value: '', label: 'Без модификатора' }],
    [modifiers],
  );

  const materialOptions: SelectOption[] = React.useMemo(
    () => (materials ?? []).map((item) => ({ value: item.material_id, label: item.name })),
    [materials],
  );

  const armorTypeOptions: SelectOption[] = React.useMemo(
    () => (armorTypes ?? []).map((item) => ({ value: item.key, label: item.label || item.key })),
    [armorTypes],
  );

  const defaultPieceType = React.useMemo(() => pieceTypeOptions[0]?.value ?? 'gp', [pieceTypeOptions]);
  const defaultWeightUnit = React.useMemo(() => weightUnitOptions[0]?.value ?? 'lb', [weightUnitOptions]);

  const weightValue = watch('weight');
  const costValue = watch('cost');
  const modifierValue = watch('armor_class.modifier');
  const maxModifierBonusValue = watch('armor_class.max_modifier_bonus');

  React.useEffect(() => {
    setWeightCountInput(stringifyNumber(weightValue?.count));
  }, [weightValue?.count, weightValue]);

  React.useEffect(() => {
    setCostCountInput(stringifyNumber(costValue?.count));
  }, [costValue?.count, costValue]);

  React.useEffect(() => {
    setMaxModifierBonusInput(stringifyNumber(modifierValue ? maxModifierBonusValue : null));
  }, [modifierValue, maxModifierBonusValue]);

  const createMutation = useMutation({
    mutationFn: createArmor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armors'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: ArmorCreateInput) => {
      if (!armorId) {
        throw new Error('armorId is required for update');
      }
      return updateArmor(armorId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armors'] });
      if (armorId) {
        queryClient.invalidateQueries({ queryKey: ['armors', armorId] });
      }
    },
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleRetryDictionaries = () => {
    refetchPieceTypes();
    refetchWeightUnits();
    refetchModifiers();
    refetchMaterials();
    refetchArmorTypes();
  };

  const handleBackPress = () => {
    if (isDirty) {
      Alert.alert('Есть несохранённые изменения', 'Выйти без сохранения?', [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Покинуть', style: 'destructive', onPress: () => router.back() },
      ]);
      return;
    }

    router.back();
  };

  const handleRequiredNumberChange = (
    text: string,
    setInput: (value: string) => void,
    onChange: (value: number) => void,
  ) => {
    setInput(text);
    const trimmed = text.trim();
    if (trimmed === '') {
      onChange(0 as number);
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleOptionalNumberChange = (
    text: string,
    setInput: (value: string) => void,
    onChange: (value: number | null) => void,
  ) => {
    setInput(text);
    const trimmed = text.trim();
    if (trimmed === '') {
      onChange(null);
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleCostToggle = (enabled: boolean) => {
    setHasCost(enabled);
    if (enabled) {
      setValue('cost', { count: 1, piece_type: defaultPieceType });
      setCostCountInput('1');
    } else {
      setValue('cost', null);
      setCostCountInput('');
    }
  };

  const handleWeightToggle = (enabled: boolean) => {
    setHasWeight(enabled);
    if (enabled) {
      setValue('weight', { count: 1, unit: defaultWeightUnit });
      setWeightCountInput('1');
    } else {
      setValue('weight', null);
      setWeightCountInput('');
    }
  };

  const navigateToDetails = (id: string) => {
    router.replace({
      pathname: '/(tabs)/library/equipment/armors/[armorId]',
      params: { armorId: id },
    });
  };

  const onSubmit = async (values: ArmorCreateInput) => {
    setSubmitError(null);

    const payload: ArmorCreateInput = {
      ...values,
      armor_class: {
        ...values.armor_class,
        modifier: values.armor_class.modifier || null,
        max_modifier_bonus:
          values.armor_class.modifier && values.armor_class.max_modifier_bonus !== null
            ? values.armor_class.max_modifier_bonus
            : null,
      },
      weight: hasWeight ? values.weight : null,
      cost: hasCost ? values.cost : null,
      material_id: values.material_id || null,
    };

    try {
      if (mode === 'edit') {
        if (!armorId) {
          setSubmitError('Не удалось определить доспех для редактирования');
          return;
        }

        await updateMutation.mutateAsync(payload);
        onSuccess ? onSuccess(armorId) : navigateToDetails(armorId);
        return;
      }

      const created = await createMutation.mutateAsync(payload);
      queryClient.setQueryData(['armors', created.armor_id], created);

      const createdId = created.armor_id;
      if (onSuccess) {
        onSuccess(createdId);
      } else {
        navigateToDetails(createdId);
      }
    } catch (error) {
      console.error('Armor form submit error:', error);
      setSubmitError(
        mode === 'edit'
          ? 'Не удалось сохранить изменения доспеха. Попробуйте ещё раз.'
          : 'Не удалось создать доспех. Попробуйте ещё раз.',
      );
    }
  };

  const hasDictionaryError =
    isErrorPieceTypes || isErrorWeightUnits || isErrorModifiers || isErrorMaterials || isErrorArmorTypes;

  const isLoadingDictionaries =
    isLoadingPieceTypes || isLoadingWeightUnits || isLoadingModifiers || isLoadingMaterials || isLoadingArmorTypes;

  const formTitle = mode === 'edit' ? 'Редактировать доспех' : 'Создать доспех';
  const submitLabel = mode === 'edit' ? 'Сохранить изменения' : 'Создать доспех';
  const hasModifier = Boolean(modifierValue);

  return (
    <FormScreenLayout title={formTitle} showBackButton={showBackButton} onBackPress={handleBackPress}>
      {submitError ? <FormErrorText>{submitError}</FormErrorText> : null}

      {isLoadingDictionaries ? (
        <View style={styles.infoRow}>
          <ActivityIndicator color={colors.textSecondary} />
          <BodyText style={styles.helperText}>Загружаю справочники…</BodyText>
        </View>
      ) : null}

      {hasDictionaryError ? (
        <View style={[styles.card, styles.warningCard]}>
          <BodyText style={[styles.helperText, styles.errorText]}>Не удалось загрузить справочники</BodyText>
          <Pressable style={styles.retryButton} onPress={handleRetryDictionaries}>
            <BodyText style={styles.retryButtonText}>Повторить</BodyText>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.card}>
        <BodyText style={styles.sectionTitle}>Основное</BodyText>

        {armorTypeOptions.length > 0 ? (
          <View style={styles.field}>
            <Controller
              control={control}
              name="armor_type"
              render={({ field: { value, onChange } }) => (
                <SelectField
                  label="Тип доспеха *"
                  value={value}
                  onChange={(selected) => onChange(selected)}
                  options={armorTypeOptions}
                  errorMessage={errors.armor_type?.message}
                  placeholder="Выберите тип"
                />
              )}
            />
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={styles.label}>Тип доспеха *</Text>
            <Controller
              control={control}
              name="armor_type"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Лёгкий"
                  style={styles.input}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            {errors.armor_type ? <FormErrorText>{errors.armor_type.message}</FormErrorText> : null}
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Название *</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Кольчуга"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          {errors.name ? <FormErrorText>{errors.name.message}</FormErrorText> : null}
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
                placeholder="Особенности доспеха"
                style={[styles.input, styles.multilineInput]}
                placeholderTextColor={colors.inputPlaceholder}
                multiline
              />
            )}
          />
          {errors.description ? <FormErrorText>{errors.description.message}</FormErrorText> : null}
        </View>
      </View>

      <View style={styles.card}>
        <BodyText style={styles.sectionTitle}>Класс доспеха</BodyText>

        <View style={styles.field}>
          <Text style={styles.label}>Базовый AC *</Text>
          <Controller
            control={control}
            name="armor_class.base_class"
            render={({ field: { onChange, onBlur } }) => (
              <TextInput
                value={baseClassInput}
                onChangeText={(text) => handleRequiredNumberChange(text, setBaseClassInput, onChange)}
                onBlur={onBlur}
                placeholder="10"
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          {errors.armor_class?.base_class ? (
            <FormErrorText>{errors.armor_class.base_class.message}</FormErrorText>
          ) : null}
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="armor_class.modifier"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Модификатор"
                value={value ?? ''}
                onChange={(selected) => {
                  const nextValue = selected || null;
                  onChange(nextValue);
                  if (!nextValue) {
                    setValue('armor_class.max_modifier_bonus', null);
                  }
                }}
                options={modifierOptions}
                errorMessage={errors.armor_class?.modifier?.message}
                placeholder="Без модификатора"
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Макс. бонус модификатора</Text>
          <Controller
            control={control}
            name="armor_class.max_modifier_bonus"
            render={({ field: { onChange, onBlur } }) => (
              <TextInput
                value={maxModifierBonusInput}
                onChangeText={(text) => handleOptionalNumberChange(text, setMaxModifierBonusInput, onChange)}
                onBlur={onBlur}
                placeholder="2"
                keyboardType="numeric"
                style={[styles.input, !hasModifier && styles.disabledInput]}
                placeholderTextColor={colors.inputPlaceholder}
                editable={hasModifier}
              />
            )}
          />
          {errors.armor_class?.max_modifier_bonus ? (
            <FormErrorText>{errors.armor_class.max_modifier_bonus.message}</FormErrorText>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <BodyText style={styles.sectionTitle}>Ограничения</BodyText>

        <View style={styles.field}>
          <Text style={styles.label}>Требование силы</Text>
          <Controller
            control={control}
            name="strength"
            render={({ field: { onChange, onBlur } }) => (
              <TextInput
                value={strengthInput}
                onChangeText={(text) => handleRequiredNumberChange(text, setStrengthInput, onChange)}
                onBlur={onBlur}
                placeholder="0"
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          {errors.strength ? <FormErrorText>{errors.strength.message}</FormErrorText> : null}
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Помеха к скрытности</Text>
            <BodyText style={styles.helperText}>Включите, если в доспехе сложно скрываться</BodyText>
          </View>
          <Controller
            control={control}
            name="stealth"
            render={({ field: { value, onChange } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: colors.borderMuted, true: colors.buttonPrimary }}
                thumbColor={value ? colors.buttonPrimaryText : undefined}
              />
            )}
          />
        </View>
      </View>

      <View style={styles.card}>
        <BodyText style={styles.sectionTitle}>Вес</BodyText>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Есть вес</Text>
            <BodyText style={styles.helperText}>Укажите, если нужно учитывать вес</BodyText>
          </View>
          <Switch
            value={hasWeight}
            onValueChange={handleWeightToggle}
            trackColor={{ false: colors.borderMuted, true: colors.buttonPrimary }}
            thumbColor={hasWeight ? colors.buttonPrimaryText : undefined}
          />
        </View>

        {hasWeight ? (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Вес</Text>
              <Controller
                control={control}
                name="weight.count"
                render={({ field: { onChange, onBlur } }) => (
                  <TextInput
                    value={weightCountInput}
                    onChangeText={(text) => handleRequiredNumberChange(text, setWeightCountInput, onChange)}
                    onBlur={onBlur}
                    placeholder="1"
                    keyboardType="numeric"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              {errors.weight?.count ? <FormErrorText>{errors.weight.count.message}</FormErrorText> : null}
            </View>

            <View style={styles.field}>
              <Controller
                control={control}
                name="weight.unit"
                render={({ field: { value, onChange } }) => (
                  <SelectField
                    label="Единица веса"
                    value={value}
                    onChange={onChange}
                    options={weightUnitOptions}
                    errorMessage={errors.weight?.unit?.message}
                    placeholder="Выберите единицу"
                    isLoading={isLoadingWeightUnits}
                  />
                )}
              />
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.card}>
        <BodyText style={styles.sectionTitle}>Стоимость</BodyText>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Есть стоимость</Text>
            <BodyText style={styles.helperText}>Укажите, если стоимость нужна</BodyText>
          </View>
          <Switch
            value={hasCost}
            onValueChange={handleCostToggle}
            trackColor={{ false: colors.borderMuted, true: colors.buttonPrimary }}
            thumbColor={hasCost ? colors.buttonPrimaryText : undefined}
          />
        </View>

        {hasCost ? (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Стоимость</Text>
              <Controller
                control={control}
                name="cost.count"
                render={({ field: { onChange, onBlur } }) => (
                  <TextInput
                    value={costCountInput}
                    onChangeText={(text) => handleRequiredNumberChange(text, setCostCountInput, onChange)}
                    onBlur={onBlur}
                    placeholder="1"
                    keyboardType="numeric"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              {errors.cost?.count ? <FormErrorText>{errors.cost.count.message}</FormErrorText> : null}
            </View>

            <View style={styles.field}>
              <Controller
                control={control}
                name="cost.piece_type"
                render={({ field: { value, onChange } }) => (
                  <SelectField
                    label="Тип монеты"
                    value={value}
                    onChange={onChange}
                    options={pieceTypeOptions}
                    errorMessage={errors.cost?.piece_type?.message}
                    placeholder="Выберите тип"
                    isLoading={isLoadingPieceTypes}
                  />
                )}
              />
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.card}>
        <BodyText style={styles.sectionTitle}>Материал</BodyText>
        <Controller
          control={control}
          name="material_id"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Материал"
              value={value}
              onChange={(selected) => onChange(selected || null)}
              options={materialOptions}
              errorMessage={errors.material_id?.message}
              placeholder="Выберите материал"
              isLoading={isLoadingMaterials}
            />
          )}
        />
      </View>

      <FormSubmitButton
        title={submitLabel}
        onPress={handleSubmit(onSubmit)}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </FormScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: 12,
  },
  warningCard: {
    borderColor: colors.error,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  field: {
    gap: 6,
  },
  label: {
    fontWeight: '600',
    color: colors.textPrimary,
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
  disabledInput: {
    opacity: 0.6,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    color: colors.textSecondary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '500',
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
  },
});
