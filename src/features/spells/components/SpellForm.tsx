import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { createSpell } from "@/features/spells/api/createSpell";
import {
  SpellCreateSchema,
  type SpellCreateInput,
} from "@/features/spells/api/types";
import { updateSpell } from "@/features/spells/api/updateSpell";
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
  } = useForm<SpellCreateInput>({
    resolver: zodResolver(SpellCreateSchema),
    defaultValues: formDefaultValues,
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

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
                    onChangeText={(text) => onChange(Number(text))}
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
                    onChangeText={(text) => onChange(Number(text))}
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
                    onChangeText={(text) => onChange(Number(text))}
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

        {/* TODO: блоки Привязки / Тип урона / Сейвы можно добавить позже */}
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
});
