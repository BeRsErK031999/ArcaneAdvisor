import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";

import { createSpell } from "@/features/spells/api/createSpell";
import {
  SpellCreateSchema,
  type SpellCreateInput,
} from "@/features/spells/api/types";
import { updateSpell } from "@/features/spells/api/updateSpell";
import { getSources } from "@/features/sources/api/getSources";
import { FormErrorText } from "@/shared/forms/FormErrorText";
import { FormScreenLayout } from "@/shared/forms/FormScreenLayout";
import { FormSubmitButton } from "@/shared/forms/FormSubmitButton";
import { colors } from "@/shared/theme/colors";

type SpellFormMode = "create" | "edit";

interface SpellFormProps {
  mode?: SpellFormMode;
  spellId?: string;
  initialValues?: SpellCreateInput;
  onSuccess?: () => void;
  submitLabel?: string;
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
}) => {
  if (mode === "edit" && !spellId) {
    console.warn("SpellForm: spellId is required in edit mode");
  }

  const queryClient = useQueryClient();
  const formDefaultValues = initialValues ?? defaultValues;

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
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const sourcesQuery = useQuery({ queryKey: ["sources"], queryFn: getSources });
  const currentSourceId = watch("source_id");
  const currentDuration = watch("duration.game_time");
  const currentSplash = watch("splash.splash");

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  React.useEffect(() => {
    if (
      !initialValues &&
      !currentSourceId &&
      sourcesQuery.data &&
      sourcesQuery.data.length > 0
    ) {
      setValue("source_id", sourcesQuery.data[0].source_id);
    }
  }, [currentSourceId, initialValues, setValue, sourcesQuery.data]);

  const createMutation = useMutation({
    mutationFn: createSpell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spells"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: SpellCreateInput) => {
      if (!spellId) {
        throw new Error("spellId is required for update");
      }
      return updateSpell(spellId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spells"] });
      if (spellId) {
        queryClient.invalidateQueries({ queryKey: ["spells", spellId] });
      }
    },
  });

  const onSubmit = async (values: SpellCreateInput) => {
    setSubmitError(null);
    try {
      if (mode === "edit") {
        if (!spellId) {
          console.warn("SpellForm: cannot submit edit mode without spellId");
          setSubmitError(
            "Не удалось сохранить изменения заклинания. Попробуйте ещё раз.",
          );
          return;
        }
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
        reset();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Spell form submit error:", error);
      setSubmitError(
        mode === "edit"
          ? "Не удалось сохранить изменения заклинания. Попробуйте ещё раз."
          : "Не удалось сохранить заклинание. Попробуйте ещё раз.",
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const formTitle =
    mode === "edit" ? "Редактировать заклинание" : "Создать заклинание";
  const finalSubmitLabel =
    submitLabel ??
    (mode === "edit" ? "Сохранить изменения" : "Создать заклинание");

  return (
    <FormScreenLayout title={formTitle}>
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      {/* Карточка формы */}
      <View style={styles.formCard}>
        {/* Блок: Основное */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основное</Text>

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
                  placeholder="Огненный шар"
                  style={styles.input}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            <FormErrorText>{errors.name?.message}</FormErrorText>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Название (англ.)</Text>
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
            <Text style={styles.label}>Источник</Text>
            <Controller
              control={control}
              name="source_id"
              render={({ field: { value, onChange } }) => (
                <View style={styles.selectorContainer}>
                  {sourcesQuery.isLoading ? (
                    <Text style={styles.mutedText}>Загрузка источников...</Text>
                  ) : null}

                  {sourcesQuery.isError ? (
                    <Text style={styles.errorText}>
                      Не удалось загрузить источники
                    </Text>
                  ) : null}

                  {!sourcesQuery.isLoading &&
                  !sourcesQuery.isError &&
                  sourcesQuery.data ? (
                    <View style={styles.sourceList}>
                      {sourcesQuery.data.map((source) => {
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
                            <Text style={styles.label}>{source.name}</Text>
                            <Text style={styles.mutedText}>{source.name_in_english}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="UUID источника"
                      style={styles.input}
                      placeholderTextColor={colors.inputPlaceholder}
                    />
                  )}
                </View>
              )}
            />
            <FormErrorText>{errors.source_id?.message}</FormErrorText>
          </View>

          {/* Уровень + Школа в одну строку на десктопе */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Уровень</Text>
              <Controller
                control={control}
                name="level"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value?.toString() ?? ""}
                    onChangeText={(text) => onChange(Number(text) || 0)}
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
              <Text style={styles.label}>Школа</Text>
              <Controller
                control={control}
                name="school"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Эвокация"
                    style={styles.input}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                )}
              />
              <FormErrorText>{errors.school?.message}</FormErrorText>
            </View>
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
          <Text style={styles.label}>Время накладывания</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Controller
                control={control}
                name="casting_time.count"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value?.toString() ?? ""}
                    onChangeText={(text) => onChange(Number(text) || 0)}
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
          <Text style={styles.label}>Дистанция</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Controller
                control={control}
                name="spell_range.count"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value?.toString() ?? ""}
                    onChangeText={(text) => onChange(Number(text) || 0)}
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
            <Text style={styles.label}>Тип урона (ключ)</Text>
            <Controller
              control={control}
              name="damage_type.name"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value ?? ""}
                  onChangeText={(text) => onChange(text.trim() === "" ? null : text)}
                  onBlur={onBlur}
                  placeholder="fire"
                  style={styles.input}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            <FormErrorText>{errors.damage_type?.name?.message}</FormErrorText>
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
                        value={value?.toString() ?? ""}
                        onChangeText={(text) => onChange(Number(text) || 0)}
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
                        value={value?.toString() ?? ""}
                        onChangeText={(text) => onChange(Number(text) || 0)}
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
                <Switch value={value} onValueChange={onChange} />
              )}
            />
          </View>
          <FormErrorText>
            {errors.components?.material?.message}
          </FormErrorText>

          <View style={styles.field}>
            <Text style={styles.label}>Материалы (через запятую)</Text>
            <Controller
              control={control}
              name="components.materials"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value.join(", ")}
                  onChangeText={(text) =>
                    onChange(
                      text
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0),
                    )
                  }
                  onBlur={onBlur}
                  placeholder="перо совы, кварц"
                  style={styles.input}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            <FormErrorText>
              {errors.components?.materials?.message}
            </FormErrorText>
          </View>
        </View>

        {/* Блок: Классы и сейвы */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Привязки</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Идентификаторы классов (через запятую)</Text>
            <Controller
              control={control}
              name="class_ids"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value.join(", ")}
                  onChangeText={(text) =>
                    onChange(
                      text
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0),
                    )
                  }
                  onBlur={onBlur}
                  placeholder="UUID классов"
                  style={styles.input}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            <FormErrorText>{errors.class_ids?.message}</FormErrorText>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Идентификаторы подклассов (через запятую)</Text>
            <Controller
              control={control}
              name="subclass_ids"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value.join(", ")}
                  onChangeText={(text) =>
                    onChange(
                      text
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0),
                    )
                  }
                  onBlur={onBlur}
                  placeholder="UUID подклассов"
                  style={styles.input}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            <FormErrorText>{errors.subclass_ids?.message}</FormErrorText>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Спасброски (через запятую)</Text>
            <Controller
              control={control}
              name="saving_throws"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value.join(", ")}
                  onChangeText={(text) =>
                    onChange(
                      text
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0),
                    )
                  }
                  onBlur={onBlur}
                  placeholder="strength, dexterity"
                  style={styles.input}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            <FormErrorText>{errors.saving_throws?.message}</FormErrorText>
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
  selectorContainer: {
    gap: 8,
  },
  mutedText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  sourceList: {
    gap: 8,
  },
  sourceItem: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 6,
    padding: 10,
    backgroundColor: colors.inputBackground,
    gap: 4,
  },
  sourceItemSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
});
