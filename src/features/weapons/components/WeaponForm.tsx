import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { createWeapon } from '@/features/weapons/api/createWeapon';
import { updateWeapon } from '@/features/weapons/api/updateWeapon';
import { WeaponCreateSchema, type WeaponCreateInput } from '@/features/weapons/api/types';
import { getWeaponKinds } from '@/features/weapon-kinds/api/getWeaponKinds';
import type { WeaponKind } from '@/features/weapon-kinds/api/types';
import { getWeaponProperties } from '@/features/weapon-properties/api/getWeaponProperties';
import type { WeaponProperty } from '@/features/weapon-properties/api/types';
import { getWeaponPropertyNames } from '@/features/weapon-properties/api/getWeaponPropertyNames';
import { getMaterials } from '@/features/materials/api/getMaterials';
import { getPieceTypes } from '@/features/dictionaries/api/getPieceTypes';
import { getDiceTypes } from '@/features/dictionaries/api/getDiceTypes';
import { getDamageTypes } from '@/features/dictionaries/api/getDamageTypes';
import { getWeightUnits } from '@/features/dictionaries/api/getWeightUnits';
import { FormErrorText } from '@/shared/forms/FormErrorText';
import { FormScreenLayout } from '@/shared/forms/FormScreenLayout';
import { FormSubmitButton } from '@/shared/forms/FormSubmitButton';
import { SelectField, type SelectOption } from '@/shared/forms/SelectField';
import { colors } from '@/shared/theme/colors';
import { BodyText } from '@/shared/ui/Typography';

interface WeaponFormProps {
  mode: 'create' | 'edit';
  weaponId?: string;
  initialValues?: WeaponCreateInput;
  onSuccess?: (weaponId: string) => void;
  showBackButton?: boolean;
}

const defaultValues: WeaponCreateInput = {
  weapon_kind_id: '',
  name: '',
  description: '',
  cost: null,
  damage: {
    dice: {
      count: 1,
      dice_type: '',
    },
    damage_type: '',
    bonus_damage: 0,
  },
  weight: null,
  weapon_property_ids: [],
  material_id: '',
};

export function WeaponForm({
  mode,
  weaponId,
  initialValues,
  onSuccess,
  showBackButton,
}: WeaponFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formDefaultValues = initialValues ?? defaultValues;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<WeaponCreateInput>({
    resolver: zodResolver(WeaponCreateSchema),
    defaultValues: formDefaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [hasCost, setHasCost] = React.useState<boolean>(Boolean(initialValues?.cost));
  const [hasWeight, setHasWeight] = React.useState<boolean>(Boolean(initialValues?.weight));

  React.useEffect(() => {
    setHasCost(Boolean(initialValues?.cost));
    setHasWeight(Boolean(initialValues?.weight));
  }, [initialValues]);

  const weaponKindsQuery = useQuery<WeaponKind[], Error>({
    queryKey: ['weapon-kinds'],
    queryFn: () => getWeaponKinds(),
  });
  const weaponPropertiesQuery = useQuery<WeaponProperty[], Error>({
    queryKey: ['weapon-properties'],
    queryFn: () => getWeaponProperties(),
  });
  const weaponPropertyNamesQuery = useQuery({
    queryKey: ['weapon-property-names'],
    queryFn: getWeaponPropertyNames,
  });
  const materialsQuery = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const pieceTypesQuery = useQuery({ queryKey: ['piece-types'], queryFn: getPieceTypes });
  const diceTypesQuery = useQuery({ queryKey: ['dice-types'], queryFn: getDiceTypes });
  const damageTypesQuery = useQuery({ queryKey: ['damage-types'], queryFn: getDamageTypes });
  const weightUnitsQuery = useQuery({ queryKey: ['weight-units'], queryFn: getWeightUnits });

  const hasWeaponKinds = (weaponKindsQuery.data?.length ?? 0) > 0;
  const hasMaterials = (materialsQuery.data?.length ?? 0) > 0;

  const canCreateWeapon = hasWeaponKinds && hasMaterials;

  const isLoadingDictionaries =
    weaponKindsQuery.isLoading ||
    weaponPropertiesQuery.isLoading ||
    weaponPropertyNamesQuery.isLoading ||
    materialsQuery.isLoading ||
    pieceTypesQuery.isLoading ||
    diceTypesQuery.isLoading ||
    damageTypesQuery.isLoading ||
    weightUnitsQuery.isLoading;

  const hasDictionaryError =
    weaponKindsQuery.isError ||
    weaponPropertiesQuery.isError ||
    weaponPropertyNamesQuery.isError ||
    materialsQuery.isError ||
    pieceTypesQuery.isError ||
    diceTypesQuery.isError ||
    damageTypesQuery.isError ||
    weightUnitsQuery.isError;

  const weaponKindOptions = React.useMemo(
    () => weaponKindsQuery.data ?? [],
    [weaponKindsQuery.data],
  );

  const materialOptions = React.useMemo(
    () => materialsQuery.data ?? [],
    [materialsQuery.data],
  );

  const weaponPropertyOptions = React.useMemo(
    () => weaponPropertiesQuery.data ?? [],
    [weaponPropertiesQuery.data],
  );

  const weaponPropertyNameMap = React.useMemo(() => {
    if (!weaponPropertyNamesQuery.data) return new Map<string, string>();
    return new Map(
      weaponPropertyNamesQuery.data.map(({ key, label }) => [key, label || key]),
    );
  }, [weaponPropertyNamesQuery.data]);

  const pieceTypeOptions: SelectOption[] = React.useMemo(
    () =>
      pieceTypesQuery.data
        ? Object.entries(pieceTypesQuery.data).map(([value, label]) => ({
            value,
            label: label || value,
          }))
        : [],
    [pieceTypesQuery.data],
  );

  const diceTypeOptions: SelectOption[] = React.useMemo(
    () =>
      diceTypesQuery.data
        ? Object.entries(diceTypesQuery.data).map(([value, label]) => ({
            value,
            label: label || value,
          }))
        : [],
    [diceTypesQuery.data],
  );

  const damageTypeOptions: SelectOption[] = React.useMemo(
    () =>
      damageTypesQuery.data
        ? Object.entries(damageTypesQuery.data).map(([value, label]) => ({
            value,
            label: label || value,
          }))
        : [],
    [damageTypesQuery.data],
  );

  const weightUnitOptions: SelectOption[] = React.useMemo(
    () =>
      weightUnitsQuery.data
        ? Object.entries(weightUnitsQuery.data).map(([value, label]) => ({
            value,
            label: label || value,
          }))
        : [],
    [weightUnitsQuery.data],
  );

  const defaultPieceType = pieceTypeOptions[0]?.value ?? '';
  const defaultWeightUnit = weightUnitOptions[0]?.value ?? '';

  const createMutation = useMutation({
    mutationFn: createWeapon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapons'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: WeaponCreateInput) => {
      if (!weaponId) {
        throw new Error('weaponId is required for update');
      }
      return updateWeapon(weaponId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapons'] });
      if (weaponId) {
        queryClient.invalidateQueries({ queryKey: ['weapons', weaponId] });
      }
    },
  });

  const handleNumericChange = (
    text: string,
    onChange: (value: number | undefined) => void,
  ) => {
    if (text === '') {
      onChange(undefined);
      return;
    }

    const parsed = Number(text);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const selectedProperties = watch('weapon_property_ids');
  const handleToggleProperty = (propertyId: string) => {
    const nextValue = selectedProperties.includes(propertyId)
      ? selectedProperties.filter((id) => id !== propertyId)
      : [...selectedProperties, propertyId];

    setValue('weapon_property_ids', nextValue);
  };

  const handleToggleCost = (value: boolean) => {
    setHasCost(value);
    if (!value) {
      setValue('cost', null);
    } else {
      const currentCost = watch('cost');
      setValue('cost', {
        count: currentCost?.count && currentCost.count > 0 ? currentCost.count : 1,
        piece_type: currentCost?.piece_type || defaultPieceType,
      });
    }
  };

  const handleToggleWeight = (value: boolean) => {
    setHasWeight(value);
    if (!value) {
      setValue('weight', null);
    } else {
      const currentWeight = watch('weight');
      setValue('weight', {
        count: currentWeight?.count && currentWeight.count > 0 ? currentWeight.count : 1,
        unit: currentWeight?.unit || defaultWeightUnit,
      });
    }
  };

  const handleBackPress = () => {
    if (isDirty) {
      Alert.alert('Есть несохранённые изменения', 'Выйти без сохранения?', [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: () => router.back() },
      ]);
      return;
    }

    router.back();
  };

  const onSubmit = async (values: WeaponCreateInput) => {
    setSubmitError(null);

    const payload: WeaponCreateInput = {
      ...values,
      cost: hasCost ? values.cost : null,
      weight: hasWeight ? values.weight : null,
    };

    try {
      if (mode === 'edit') {
        await updateMutation.mutateAsync(payload);
      } else {
        const createdWeapon = await createMutation.mutateAsync(payload);
        if (!createdWeapon.weapon_id) {
          throw new Error('Не удалось получить идентификатор созданного оружия');
        }
        if (onSuccess) {
          onSuccess(createdWeapon.weapon_id);
        } else {
          router.replace({
            pathname: '/(tabs)/library/equipment/weapons/[weaponId]',
            params: { weaponId: createdWeapon.weapon_id },
          });
        }
        return;
      }

      if (onSuccess) {
        onSuccess(weaponId ?? '');
      } else {
        router.replace({
          pathname: '/(tabs)/library/equipment/weapons/[weaponId]',
          params: { weaponId: weaponId ?? '' },
        });
      }
    } catch (error) {
      console.error('Weapon form submit error:', error);
      setSubmitError('Не удалось сохранить оружие. Попробуйте ещё раз.');
    }
  };

  if (isLoadingDictionaries) {
    return (
      <View style={[styles.centered, styles.containerPadding]}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю данные…</BodyText>
      </View>
    );
  }

  if (hasDictionaryError) {
    return (
      <View style={[styles.centered, styles.containerPadding]}>
        <BodyText style={[styles.helperText, styles.errorText]}>
          Не удалось загрузить данные
        </BodyText>
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            weaponKindsQuery.refetch();
            weaponPropertiesQuery.refetch();
            materialsQuery.refetch();
            pieceTypesQuery.refetch();
            diceTypesQuery.refetch();
            damageTypesQuery.refetch();
            weightUnitsQuery.refetch();
            weaponPropertyNamesQuery.refetch();
          }}
        >
          <BodyText style={styles.retryButtonText}>Повторить</BodyText>
        </Pressable>
      </View>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const formTitle = mode === 'edit' ? 'Редактировать оружие' : 'Создать оружие';

  if (!canCreateWeapon) {
    return (
      <FormScreenLayout
        title={formTitle}
        showBackButton={showBackButton}
        onBackPress={handleBackPress}
      >
        <View style={styles.missingBlock}>
          <BodyText style={styles.sectionTitle}>Нельзя создать оружие</BodyText>

          <BodyText style={styles.helperText}>
            Для создания оружия нужны базовые справочники. Сейчас отсутствуют:
          </BodyText>

          {!hasWeaponKinds && (
            <BodyText style={styles.missingItem}>
              • Виды оружия (Weapon Kinds) — создайте хотя бы один тип оружия.
            </BodyText>
          )}

          {!hasMaterials && (
            <BodyText style={styles.missingItem}>
              • Материалы (Materials) — добавьте материалы в базе.
            </BodyText>
          )}

          <View style={styles.actionsRow}>
            {!hasWeaponKinds && (
              <Pressable
                style={styles.primaryButton}
                onPress={() =>
                  router.push('/(tabs)/library/equipment/weapon-kinds/create')
                }
              >
                <BodyText style={styles.primaryButtonText}>Создать вид оружия</BodyText>
              </Pressable>
            )}

            {!hasMaterials && (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.push('/(tabs)/library/equipment/materials')}
              >
                <BodyText style={styles.secondaryButtonText}>Открыть материалы</BodyText>
              </Pressable>
            )}
          </View>
        </View>
      </FormScreenLayout>
    );
  }

  return (
    <FormScreenLayout
      title={formTitle}
      showBackButton={showBackButton}
      onBackPress={handleBackPress}
    >
      <View style={styles.section}>
        <BodyText style={styles.sectionTitle}>Основное</BodyText>

        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Название *</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Меч длинный"
                style={styles.input}
              />
              {errors.name ? <FormErrorText>{errors.name.message}</FormErrorText> : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Описание</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Краткое описание"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
              />
              {errors.description ? (
                <FormErrorText>{errors.description.message}</FormErrorText>
              ) : null}
            </View>
          )}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Вид оружия *</Text>
          <View style={styles.chipsContainer}>
            {weaponKindOptions.map((kind) => (
              <Pressable
                key={kind.weapon_kind_id}
                style={[
                  styles.chip,
                  watch('weapon_kind_id') === kind.weapon_kind_id && styles.chipSelected,
                ]}
                onPress={() => setValue('weapon_kind_id', kind.weapon_kind_id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    watch('weapon_kind_id') === kind.weapon_kind_id && styles.chipTextSelected,
                  ]}
                >
                  {kind.name}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.weapon_kind_id ? (
            <FormErrorText>{errors.weapon_kind_id.message}</FormErrorText>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Материал *</Text>
          <View style={styles.chipsContainer}>
            {materialOptions.map((material) => (
              <Pressable
                key={material.material_id}
                style={[
                  styles.chip,
                  watch('material_id') === material.material_id && styles.chipSelected,
                ]}
                onPress={() => setValue('material_id', material.material_id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    watch('material_id') === material.material_id && styles.chipTextSelected,
                  ]}
                >
                  {material.name}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.material_id ? (
            <FormErrorText>{errors.material_id.message}</FormErrorText>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <BodyText style={styles.sectionTitle}>Стоимость</BodyText>
          <View style={styles.switchRow}>
            <BodyText>Есть стоимость?</BodyText>
            <Switch value={hasCost} onValueChange={handleToggleCost} />
          </View>
        </View>

        <Controller
          control={control}
          name="cost.count"
          render={({ field: { value, onChange } }) => (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Количество</Text>
              <TextInput
                value={hasCost ? String(value ?? '') : ''}
                onChangeText={(text) => handleNumericChange(text, onChange)}
                editable={hasCost}
                keyboardType="numeric"
                style={[styles.input, !hasCost && styles.inputDisabled]}
              />
              {errors.cost?.count ? <FormErrorText>{errors.cost.count.message}</FormErrorText> : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="cost.piece_type"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Тип монеты"
              value={hasCost ? value : ''}
              onChange={onChange}
              options={pieceTypeOptions}
              errorMessage={errors.cost?.piece_type?.message}
              disabled={!hasCost}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <BodyText style={styles.sectionTitle}>Урон</BodyText>

        <Controller
          control={control}
          name="damage.dice.count"
          render={({ field: { value, onChange } }) => (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Количество кубов *</Text>
              <TextInput
                value={String(value ?? '')}
                onChangeText={(text) => handleNumericChange(text, onChange)}
                keyboardType="numeric"
                style={styles.input}
              />
              {errors.damage?.dice?.count ? (
                <FormErrorText>{errors.damage.dice.count.message}</FormErrorText>
              ) : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="damage.dice.dice_type"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Тип куба *"
              value={value}
              onChange={onChange}
              options={diceTypeOptions}
              errorMessage={errors.damage?.dice?.dice_type?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="damage.damage_type"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Тип урона *"
              value={value}
              onChange={onChange}
              options={damageTypeOptions}
              errorMessage={errors.damage?.damage_type?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="damage.bonus_damage"
          render={({ field: { value, onChange } }) => (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Бонусный урон</Text>
              <TextInput
                value={String(value ?? '')}
                onChangeText={(text) => handleNumericChange(text, onChange)}
                keyboardType="numeric"
                style={styles.input}
              />
              {errors.damage?.bonus_damage ? (
                <FormErrorText>{errors.damage.bonus_damage.message}</FormErrorText>
              ) : null}
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <BodyText style={styles.sectionTitle}>Вес</BodyText>
          <View style={styles.switchRow}>
            <BodyText>Есть вес?</BodyText>
            <Switch value={hasWeight} onValueChange={handleToggleWeight} />
          </View>
        </View>

        <Controller
          control={control}
          name="weight.count"
          render={({ field: { value, onChange } }) => (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Вес</Text>
              <TextInput
                value={hasWeight ? String(value ?? '') : ''}
                onChangeText={(text) => handleNumericChange(text, onChange)}
                editable={hasWeight}
                keyboardType="numeric"
                style={[styles.input, !hasWeight && styles.inputDisabled]}
              />
              {errors.weight?.count ? <FormErrorText>{errors.weight.count.message}</FormErrorText> : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="weight.unit"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Единица веса"
              value={hasWeight ? value : ''}
              onChange={onChange}
              options={weightUnitOptions}
              errorMessage={errors.weight?.unit?.message}
              disabled={!hasWeight}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <BodyText style={styles.sectionTitle}>Свойства оружия</BodyText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
          <View style={styles.chipsContainer}>
            {weaponPropertyOptions.map((property) => {
              const isSelected = selectedProperties.includes(property.weapon_property_id);
              const propertyLabel = weaponPropertyNameMap.get(property.name) ?? property.name;
              return (
                <Pressable
                  key={property.weapon_property_id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => handleToggleProperty(property.weapon_property_id)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {propertyLabel}
                  </Text>
                  {propertyLabel !== property.name ? (
                    <Text style={[styles.chipSubText, isSelected && styles.chipTextSelected]}>
                      {property.name}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
        {errors.weapon_property_ids ? (
          <FormErrorText>{errors.weapon_property_ids.message}</FormErrorText>
        ) : null}
      </View>

      {submitError ? <FormErrorText>{submitError}</FormErrorText> : null}

      <FormSubmitButton
        title={isSubmitting ? 'Сохраняю…' : mode === 'edit' ? 'Сохранить' : 'Создать'}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        isSubmitting={isSubmitting}
      />
    </FormScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
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
  inputDisabled: {
    opacity: 0.6,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fieldGroup: {
    gap: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
  },
  chipSelected: {
    backgroundColor: colors.buttonPrimary,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  chipSubText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  chipTextSelected: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  helperText: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 12,
  },
  containerPadding: {
    padding: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  retryButtonText: {
    color: colors.buttonSecondaryText,
    fontWeight: '500',
  },
  horizontalChips: {
    marginHorizontal: -4,
  },
  missingBlock: {
    gap: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  missingItem: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  primaryButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
