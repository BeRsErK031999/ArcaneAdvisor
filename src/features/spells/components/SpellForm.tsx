import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { createSpell } from "@/features/spells/api/createSpell";
import {
  SpellCreateSchema,
  type SpellCreateInput,
} from "@/features/spells/api/types";
import { useSpellSchools } from "@/features/spells/api/useSpellSchools";
import { updateSpell } from "@/features/spells/api/updateSpell";
import type { Class } from "@/features/classes/api/types";
import type { Subclass } from "@/features/subclasses/api/types";
import type { MaterialComponent } from "@/features/material-components/api/types";
import type { Modifiers, DamageTypesResponse } from "@/features/dictionaries/api/types";
import type { Source } from "@/features/sources/api/types";
import { FormErrorText } from "@/shared/forms/FormErrorText";
import { FormScreenLayout } from "@/shared/forms/FormScreenLayout";
import { FormSubmitButton } from "@/shared/forms/FormSubmitButton";
import { MultiSelectField } from "@/shared/forms/MultiSelectField";
import { SelectField, type SelectOption } from "@/shared/forms/SelectField";
import { colors } from "@/shared/theme/colors";
import { BodyText } from "@/shared/ui/Typography";

type SpellFormMode = "create" | "edit";

interface SpellFormProps {
  mode?: SpellFormMode;
  spellId?: string;
  initialValues?: SpellCreateInput;
  onSuccess?: (spellId: string) => void;
  submitLabel?: string;
  sources?: Source[];
  classes?: Class[];
  subclasses?: Subclass[];
  materialComponents?: MaterialComponent[];
  modifiers?: Modifiers;
  damageTypes?: DamageTypesResponse;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const defaultValues: SpellCreateInput = {
  name: "",
  description: "",
  next_level_description: "",
  level: 1,
  school: "",
  concentration: false,
  ritual: false,
  class_ids: [],
  subclass_ids: [],
  saving_throws: [],
  damage_type: { name: null },
  duration: { game_time: null },
  casting_time: { count: 1, unit: "action" },
  spell_range: { count: 60, unit: "ft" },
  splash: { splash: null },
  components: {
    verbal: false,
    symbolic: false,
    material: false,
    materials: [],
  },
  name_in_english: "",
  source_id: "",
};

export const SpellForm: React.FC<SpellFormProps> = ({
  mode = "create",
  spellId,
  initialValues,
  onSuccess,
  submitLabel,
  sources,
  classes,
  subclasses,
  materialComponents,
  modifiers,
  damageTypes,
  showBackButton,
  onBackPress,
}) => {
  if (mode === "edit" && !spellId) {
    console.warn("SpellForm: spellId is required in edit mode");
  }

  const queryClient = useQueryClient();
  const formDefaultValues = React.useMemo(() => initialValues ?? defaultValues, [initialValues]);

  const {
    schools,
    isLoading: isLoadingSchools,
    isError: isErrorSchools,
    error: errorSchools,
    refetch: refetchSchools,
  } = useSpellSchools();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SpellCreateInput>({
    resolver: zodResolver(SpellCreateSchema),
    defaultValues: formDefaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [highlightClasses, setHighlightClasses] = React.useState(false);
  const [damageTypeEnabled, setDamageTypeEnabled] = React.useState<boolean>(
    Boolean(formDefaultValues.damage_type?.name),
  );

  const currentDuration = watch("duration.game_time");
  const currentSplash = watch("splash.splash");
  const selectedClassIds = watch("class_ids");
  const selectedSubclassIds = watch("subclass_ids");
  const selectedMaterials = watch("components.materials");
  const isMaterialEnabled = watch("components.material");
  const damageTypeName = watch("damage_type.name");

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
      setDamageTypeEnabled(Boolean(initialValues.damage_type?.name));
    }
  }, [initialValues, reset]);

  React.useEffect(() => {
    if (!isMaterialEnabled && selectedMaterials.length > 0) {
      setValue("components.materials", []);
    }
  }, [isMaterialEnabled, selectedMaterials, setValue]);

  React.useEffect(() => {
    if (selectedClassIds.length > 0 && highlightClasses) {
      setHighlightClasses(false);
    }
  }, [selectedClassIds, highlightClasses]);

  const classOptions: SelectOption[] = React.useMemo(
    () =>
      (classes ?? []).map((classItem) => ({
        value: classItem.class_id,
        label:
          classItem.name_in_english && classItem.name_in_english !== classItem.name
            ? `${classItem.name} (${classItem.name_in_english})`
            : classItem.name,
      })),
    [classes],
  );

  const subclassOptions: SelectOption[] = React.useMemo(() => {
    if (!subclasses || selectedClassIds.length === 0) {
      return [];
    }

    const allowedClassIds = new Set(selectedClassIds);
    return subclasses
      .filter((subclass) => allowedClassIds.has(subclass.class_id))
      .map((subclass) => ({ value: subclass.subclass_id, label: subclass.name }));
  }, [subclasses, selectedClassIds]);

  React.useEffect(() => {
    const allowedSubclassIds = new Set(subclassOptions.map((option) => option.value));
    const filtered = selectedSubclassIds.filter((id) => allowedSubclassIds.has(id));

    if (filtered.length !== selectedSubclassIds.length) {
      setValue("subclass_ids", filtered);
    }
  }, [subclassOptions, selectedSubclassIds, setValue]);

  const materialComponentOptions: SelectOption[] = React.useMemo(
    () =>
      (materialComponents ?? []).map((component) => ({
        value: component.material_component_id,
        label: component.name,
      })),
    [materialComponents],
  );

  const modifiersOptions: SelectOption[] = React.useMemo(
    () =>
      modifiers
        ? Object.entries(modifiers).map(([value, label]) => ({
            value,
            label: label || value,
          }))
        : [],
    [modifiers],
  );

  const damageTypeOptions: SelectOption[] = React.useMemo(
    () =>
      damageTypes
        ? Object.entries(damageTypes).map(([value, label]) => ({
            value,
            label: label || value,
          }))
        : [],
    [damageTypes],
  );

  const createMutation = useMutation({
    mutationFn: createSpell,
    onSuccess: (createdSpell) => {
      queryClient.invalidateQueries({ queryKey: ["spells"] });
      if (createdSpell.spell_id) {
        queryClient.setQueryData(["spells", createdSpell.spell_id], createdSpell);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: SpellCreateInput) => {
      if (!spellId) {
        throw new Error("spellId is required for update");
      }
      return updateSpell(spellId, values);
    },
    onSuccess: (updatedSpell) => {
      queryClient.invalidateQueries({ queryKey: ["spells"] });
      if (spellId) {
        queryClient.setQueryData(["spells", spellId], updatedSpell);
        queryClient.invalidateQueries({ queryKey: ["spells", spellId] });
      }
    },
  });

  const handleNumericChange = (
    text: string,
    onChange: (value: number | undefined) => void,
  ) => {
    const trimmed = text.trim();
    if (trimmed === "") {
      onChange(undefined);
      return;
    }

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    }
  };

  const extractSubmitError = (error: unknown, currentMode: SpellFormMode) => {
    if (isAxiosError(error)) {
      const data = error.response?.data as { extra?: Array<{ message?: string }> } | undefined;
      const extraMessage = data?.extra?.find((item) => item.message)?.message;
      if (extraMessage) {
        const normalized = extraMessage.toString().toLowerCase();
        if (normalized.includes("класс") || normalized.includes("class")) {
          setHighlightClasses(true);
        }
        return extraMessage.toString();
      }
    }

    return currentMode === "edit"
      ? "Не удалось сохранить изменения заклинания. Попробуйте ещё раз."
      : "Не удалось сохранить заклинание. Попробуйте ещё раз.";
  };

  const onSubmit = async (values: SpellCreateInput) => {
    setSubmitError(null);
    setHighlightClasses(false);

    try {
      if (mode === "edit") {
        if (!spellId) {
          console.warn("SpellForm: cannot submit edit mode without spellId");
          setSubmitError("Не удалось сохранить изменения заклинания. Попробуйте ещё раз.");
          return;
        }
        await updateMutation.mutateAsync(values);
        if (onSuccess) {
          onSuccess(spellId);
        }
      } else {
        const createdSpell = await createMutation.mutateAsync(values);
        if (onSuccess) {
          onSuccess(createdSpell.spell_id);
        }
      }
    } catch (error) {
      console.error("Spell form submit error:", error);
      setSubmitError(extractSubmitError(error, mode));
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const formTitle = mode === "edit" ? "Редактировать заклинание" : "Создать заклинание";
  const finalSubmitLabel =
    submitLabel ?? (mode === "edit" ? "Сохранить изменения" : "Создать заклинание");

  return (
    <FormScreenLayout
      title={formTitle}
      showBackButton={showBackButton}
      onBackPress={onBackPress}
    >
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      {/* Карточка формы */}
      <View style={styles.formCard}>
        {/* Блок: Основное */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основное</Text>

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
                  placeholder="Огненный шар"
                  style={styles.input}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            <FormErrorText>{errors.name?.message}</FormErrorText>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Название (англ.) *</Text>
            <Controller
              control={control}
              name="name_in_english"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Fireball"
                  style={styles.input}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            <FormErrorText>{errors.name_in_english?.message}</FormErrorText>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Источник *</Text>
            <Controller
              control={control}
              name="source_id"
              render={({ field: { value, onChange } }) => (
                <View style={styles.sourceList}>
                  {(sources ?? []).map((source) => {
                    const isSelected = value === source.source_id;
                    return (
                      <Pressable
                        key={source.source_id}
                        onPress={() => onChange(source.source_id)}
                        style={[
                          styles.sourceItem,
                          isSelected && styles.sourceItemSelected,
                        ]}
                      >
                        <BodyText
                          style={
                            isSelected
                              ? styles.sourceItemTextSelected
                              : styles.sourceItemText
                          }
                        >
                          {source.name}
                        </BodyText>
                        {source.name_in_english ? (
                          <BodyText style={styles.sourceItemSubtitle}>
                            {source.name_in_english}
                          </BodyText>
                        ) : null}
                      </Pressable>
                    );
                  })}
                  {(sources ?? []).length === 0 && (
                    <BodyText style={styles.sourceEmptyText}>
                      Источников нет. Вернитесь назад и создайте хотя бы один
                      источник.
                    </BodyText>
                  )}
                </View>
              )}
            />
            <FormErrorText>{errors.source_id?.message}</FormErrorText>
          </View>

          {/* Уровень + Школа */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Уровень *</Text>
              <Controller
                control={control}
                name="level"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={typeof value === "number" && Number.isFinite(value) ? value.toString() : ""}
                    onChangeText={(text) =>
                      handleNumericChange(text, (numeric) =>
                        onChange((numeric ?? undefined) as unknown as number),
                      )
                    }
                    onBlur={onBlur}
                    keyboardType="numeric"
                    inputMode="numeric"
                    placeholder="1"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              <FormErrorText>{errors.level?.message}</FormErrorText>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Школа *</Text>
              <Controller
                control={control}
                name="school"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.schoolList}>
                    {isLoadingSchools && (
                      <BodyText style={styles.schoolHelperText}>
                        Загружаю школы заклинаний…
                      </BodyText>
                    )}

                    {isErrorSchools && (
                      <View style={styles.schoolErrorRow}>
                        <BodyText style={styles.schoolErrorText}>
                          Не удалось загрузить школы заклинаний
                        </BodyText>
                        {errorSchools?.message ? (
                          <BodyText style={styles.schoolHelperText}>
                            {errorSchools.message}
                          </BodyText>
                        ) : null}
                        <Pressable onPress={() => refetchSchools()}>
                          <BodyText style={styles.schoolRetryText}>
                            Повторить
                          </BodyText>
                        </Pressable>
                      </View>
                    )}

                    {!isLoadingSchools && !isErrorSchools && schools.length > 0 && (
                      <>
                        {schools.map((school) => {
                          const isSelected = value === school.id;

                          return (
                            <Pressable
                              key={school.id}
                              onPress={() => onChange(school.id)}
                              style={[
                                styles.schoolItem,
                                isSelected && styles.schoolItemSelected,
                              ]}
                            >
                              <Text
                                style={
                                  isSelected
                                    ? styles.schoolItemTextSelected
                                    : styles.schoolItemText
                                }
                              >
                                {school.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </>
                    )}

                    {!isLoadingSchools && !isErrorSchools && schools.length === 0 && (
                      <BodyText style={styles.schoolHelperText}>
                        Список школ заклинаний пуст.
                      </BodyText>
                    )}
                  </View>
                )}
              />
              <FormErrorText>{errors.school?.message}</FormErrorText>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Описание *</Text>
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
                  style={[styles.input, styles.textArea]}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            <FormErrorText>{errors.description?.message}</FormErrorText>
          </View>
        </View>

        {/* Блок: Механика */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Механика</Text>

          {/* Время накладывания */}
          <Text style={styles.label}>Время накладывания *</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Controller
                control={control}
                name="casting_time.count"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={typeof value === "number" && Number.isFinite(value) ? value.toString() : ""}
                    onChangeText={(text) =>
                      handleNumericChange(text, (numeric) =>
                        onChange((numeric ?? undefined) as unknown as number),
                      )
                    }
                    onBlur={onBlur}
                    keyboardType="numeric"
                    inputMode="numeric"
                    placeholder="1"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              <FormErrorText>
                {errors.casting_time?.count?.message}
              </FormErrorText>
            </View>
            <View style={styles.column}>
              <Controller
                control={control}
                name="casting_time.unit"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="action"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              <FormErrorText>
                {errors.casting_time?.unit?.message}
              </FormErrorText>
            </View>
          </View>

          {/* Дистанция */}
          <Text style={styles.label}>Дистанция *</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Controller
                control={control}
                name="spell_range.count"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={typeof value === "number" && Number.isFinite(value) ? value.toString() : ""}
                    onChangeText={(text) =>
                      handleNumericChange(text, (numeric) =>
                        onChange((numeric ?? undefined) as unknown as number),
                      )
                    }
                    onBlur={onBlur}
                    keyboardType="numeric"
                    inputMode="numeric"
                    placeholder="60"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              <FormErrorText>
                {errors.spell_range?.count?.message}
              </FormErrorText>
            </View>
            <View style={styles.column}>
              <Controller
                control={control}
                name="spell_range.unit"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="ft"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              <FormErrorText>
                {errors.spell_range?.unit?.message}
              </FormErrorText>
            </View>
          </View>

          {/* Флаги: Концентрация / Ритуал */}
          <View style={styles.flagsRow}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Концентрация</Text>
              <Controller
                control={control}
                name="concentration"
                render={({ field: { value, onChange } }) => (
                  <Switch value={value} onValueChange={onChange} />
                )}
              />
            </View>
            <FormErrorText>{errors.concentration?.message}</FormErrorText>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Ритуал</Text>
              <Controller
                control={control}
                name="ritual"
                render={({ field: { value, onChange } }) => (
                  <Switch value={value} onValueChange={onChange} />
                )}
              />
            </View>
            <FormErrorText>{errors.ritual?.message}</FormErrorText>
          </View>
        </View>

        {/* Блок: Тип урона и длительность */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Тип урона и длительность</Text>

          <View style={styles.field}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Есть тип урона?</Text>
              <Switch
                value={damageTypeEnabled}
                onValueChange={(enabled) => {
                  setDamageTypeEnabled(enabled);
                  if (!enabled) {
                    setValue("damage_type.name", null);
                  } else {
                    setValue(
                      "damage_type.name",
                      damageTypeName ?? damageTypeOptions[0]?.value ?? "",
                    );
                  }
                }}
              />
            </View>
            {damageTypeEnabled ? (
              <SelectField
                label="Тип урона"
                placeholder="Выберите тип урона"
                value={damageTypeName ?? null}
                onChange={(value) => setValue("damage_type.name", value)}
                options={damageTypeOptions}
                isLoading={false}
                disabled={damageTypeOptions.length === 0}
                errorMessage={errors.damage_type?.name?.message}
              />
            ) : null}
          </View>

          <View style={styles.field}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Есть длительность</Text>
              <Switch
                value={!!currentDuration}
                onValueChange={(enabled) => {
                  if (enabled) {
                    setValue(
                      "duration.game_time",
                      currentDuration ?? { count: 1, unit: "minute" },
                    );
                  } else {
                    setValue("duration.game_time", null);
                  }
                }}
              />
            </View>
            {currentDuration ? (
              <View style={styles.row}>
                <View style={styles.column}>
                  <Controller
                    control={control}
                    name="duration.game_time.count"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        value={typeof value === "number" && Number.isFinite(value) ? value.toString() : ""}
                        onChangeText={(text) =>
                          handleNumericChange(text, (numeric) =>
                            onChange((numeric ?? undefined) as unknown as number),
                          )
                        }
                        onBlur={onBlur}
                        keyboardType="numeric"
                        inputMode="numeric"
                        placeholder="10"
                        style={styles.input}
                        placeholderTextColor={colors.inputPlaceholder}
                      />
                    )}
                  />
                  <FormErrorText>
                    {errors.duration?.game_time?.count?.message}
                  </FormErrorText>
                </View>
                <View style={styles.column}>
                  <Controller
                    control={control}
                    name="duration.game_time.unit"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        value={value ?? ""}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="minute"
                        style={styles.input}
                        placeholderTextColor={colors.inputPlaceholder}
                      />
                    )}
                  />
                  <FormErrorText>
                    {errors.duration?.game_time?.unit?.message}
                  </FormErrorText>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Блок: Область и сплэш */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дистанция эффекта</Text>
          <View style={styles.field}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Есть область взрыва</Text>
              <Switch
                value={!!currentSplash}
                onValueChange={(enabled) => {
                  if (enabled) {
                    setValue(
                      "splash.splash",
                      currentSplash ?? { count: 5, unit: "ft" },
                    );
                  } else {
                    setValue("splash.splash", null);
                  }
                }}
              />
            </View>

            {currentSplash ? (
              <View style={styles.row}>
                <View style={styles.column}>
                  <Controller
                    control={control}
                    name="splash.splash.count"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        value={typeof value === "number" && Number.isFinite(value) ? value.toString() : ""}
                        onChangeText={(text) =>
                          handleNumericChange(text, (numeric) =>
                            onChange((numeric ?? undefined) as unknown as number),
                          )
                        }
                        onBlur={onBlur}
                        keyboardType="numeric"
                        inputMode="numeric"
                        placeholder="20"
                        style={styles.input}
                        placeholderTextColor={colors.inputPlaceholder}
                      />
                    )}
                  />
                  <FormErrorText>
                    {errors.splash?.splash?.count?.message}
                  </FormErrorText>
                </View>
                <View style={styles.column}>
                  <Controller
                    control={control}
                    name="splash.splash.unit"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        value={value ?? ""}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="ft"
                        style={styles.input}
                        placeholderTextColor={colors.inputPlaceholder}
                      />
                    )}
                  />
                  <FormErrorText>
                    {errors.splash?.splash?.unit?.message}
                  </FormErrorText>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Блок: Компоненты */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Компоненты</Text>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Вербальный</Text>
            <Controller
              control={control}
              name="components.verbal"
              render={({ field: { value, onChange } }) => (
                <Switch value={value} onValueChange={onChange} />
              )}
            />
          </View>
          <FormErrorText>{errors.components?.verbal?.message}</FormErrorText>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Соматический</Text>
            <Controller
              control={control}
              name="components.symbolic"
              render={({ field: { value, onChange } }) => (
                <Switch value={value} onValueChange={onChange} />
              )}
            />
          </View>
          <FormErrorText>
            {errors.components?.symbolic?.message}
          </FormErrorText>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Материальный</Text>
            <Controller
              control={control}
              name="components.material"
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={value}
                  onValueChange={(enabled) => {
                    onChange(enabled);
                    if (!enabled) {
                      setValue("components.materials", []);
                    }
                  }}
                />
              )}
            />
          </View>
          <FormErrorText>
            {errors.components?.material?.message}
          </FormErrorText>

          {isMaterialEnabled ? (
            <View style={styles.field}>
              <Controller
                control={control}
                name="components.materials"
                render={({ field: { value, onChange } }) => (
                  <MultiSelectField
                    label="Материальные компоненты"
                    placeholder="Выберите материальные компоненты"
                    values={value}
                    onChange={onChange}
                    options={materialComponentOptions}
                    disabled={materialComponentOptions.length === 0}
                    errorMessage={errors.components?.materials?.message}
                  />
                )}
              />
              {materialComponentOptions.length === 0 ? (
                <View style={styles.inlineHelperRow}>
                  <BodyText style={styles.helperText}>
                    Нет доступных материальных компонентов.
                  </BodyText>
                  <Link href="/(tabs)/library/equipment/material-components/create" asChild>
                    <Pressable>
                      <BodyText style={styles.linkText}>Создать</BodyText>
                    </Pressable>
                  </Link>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Блок: Классы и сейвы */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Привязки *</Text>

          <View style={[styles.field, highlightClasses && styles.fieldError]}>
            <Controller
              control={control}
              name="class_ids"
              render={({ field: { value, onChange } }) => (
                <MultiSelectField
                  label="Классы"
                  placeholder="Выберите хотя бы один класс"
                  values={value}
                  onChange={onChange}
                  options={classOptions}
                  errorMessage={errors.class_ids?.message}
                  disabled={classOptions.length === 0}
                />
              )}
            />
            {classOptions.length === 0 ? (
              <View style={styles.inlineHelperRow}>
                <BodyText style={styles.helperText}>
                  Классы не найдены.
                </BodyText>
                <Link href="/(tabs)/library/classes/create" asChild>
                  <Pressable>
                    <BodyText style={styles.linkText}>Создать класс</BodyText>
                  </Pressable>
                </Link>
              </View>
            ) : (
              <BodyText style={styles.helperText}>
                Заклинание должно быть привязано минимум к одному классу.
              </BodyText>
            )}
          </View>

          <View style={styles.field}>
            <Controller
              control={control}
              name="subclass_ids"
              render={({ field: { value, onChange } }) => (
                <MultiSelectField
                  label="Подклассы"
                  placeholder={selectedClassIds.length === 0 ? "Сначала выберите классы" : "Выберите подклассы"}
                  values={value}
                  onChange={onChange}
                  options={subclassOptions}
                  disabled={selectedClassIds.length === 0 || subclassOptions.length === 0}
                  errorMessage={errors.subclass_ids?.message}
                />
              )}
            />
            {selectedClassIds.length === 0 ? (
              <BodyText style={styles.helperText}>
                Подклассы будут доступны после выбора классов.
              </BodyText>
            ) : null}
          </View>

          <View style={styles.field}>
            <Controller
              control={control}
              name="saving_throws"
              render={({ field: { value, onChange } }) => (
                <MultiSelectField
                  label="Спасброски"
                  placeholder="Выберите характеристики"
                  values={value}
                  onChange={onChange}
                  options={modifiersOptions}
                  errorMessage={errors.saving_throws?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Описание следующего уровня</Text>
          <View style={styles.field}>
            <Controller
              control={control}
              name="next_level_description"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Как меняется заклинание"
                  multiline
                  style={[styles.input, styles.textArea]}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            <FormErrorText>
              {errors.next_level_description?.message}
            </FormErrorText>
          </View>
        </View>
      </View>

      <FormSubmitButton
        title={finalSubmitLabel}
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
    fontWeight: "600",
  },

  // Карточка формы
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: 16,
    marginBottom: 16,
  },

  // Секции формы
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
    fontSize: 16,
  },

  // Поля
  field: {
    gap: 4,
  },
  label: {
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  // Сетка
  row: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 4,
  },

  // Флаги и свитчи
  flagsRow: {
    gap: 8,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourceList: {
    gap: 8,
  },
  sourceItem: {
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
  },
  sourceItemSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated ?? colors.surface,
  },
  sourceItemText: {
    color: colors.textPrimary,
    fontWeight: "500",
  },
  sourceItemTextSelected: {
    color: colors.accent,
    fontWeight: "600",
  },
  sourceItemSubtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
  },
  sourceEmptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  schoolList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  schoolItem: {
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.backgroundSecondary,
  },
  schoolItemSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated ?? colors.surface,
  },
  schoolItemText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  schoolItemTextSelected: {
    color: colors.accent,
    fontWeight: "600",
    fontSize: 13,
  },
  schoolHelperText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  schoolErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  schoolErrorText: {
    fontSize: 13,
    color: colors.error,
  },
  schoolRetryText: {
    fontSize: 13,
    color: colors.buttonPrimary,
    fontWeight: "500",
  },
  inlineHelperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  helperText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  linkText: {
    color: colors.accent,
    fontWeight: "600",
  },
  fieldError: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    padding: 8,
  },
});
