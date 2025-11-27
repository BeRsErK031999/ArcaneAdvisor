import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { createSource } from "@/features/sources/api/createSource";
import { updateSource } from "@/features/sources/api/updateSource";
import {
  SourceCreateSchema,
  type SourceCreateInput,
} from "@/features/sources/api/types";
import { FormErrorText } from "@/shared/forms/FormErrorText";
import { FormScreenLayout } from "@/shared/forms/FormScreenLayout";
import { FormSubmitButton } from "@/shared/forms/FormSubmitButton";
import { colors } from "@/shared/theme/colors";

type SourceFormMode = "create" | "edit";

interface SourceFormProps {
  mode?: SourceFormMode;
  sourceId?: string;
  initialValues?: SourceCreateInput;
  onSuccess?: () => void;
  submitLabel?: string;
}

const defaultValues: SourceCreateInput = {
  name: "",
  description: "",
  name_in_english: "",
};

export const SourceForm: React.FC<SourceFormProps> = ({
  mode = "create",
  sourceId,
  initialValues,
  onSuccess,
  submitLabel,
}) => {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SourceCreateInput>({
    resolver: zodResolver(SourceCreateSchema),
    defaultValues: initialValues ?? defaultValues,
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const createMutation = useMutation({
    mutationFn: createSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: SourceCreateInput) => {
      if (!sourceId) {
        throw new Error("sourceId is required for update");
      }
      return updateSource(sourceId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });

  const onSubmit = async (values: SourceCreateInput) => {
    setSubmitError(null);
    try {
      if (mode === "edit") {
        if (!sourceId) {
          setSubmitError("Не указан идентификатор источника.");
          return;
        }
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
        reset(defaultValues);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Source form submit error:", error);
      setSubmitError(
        mode === "edit"
          ? "Не удалось сохранить изменения источника. Попробуйте ещё раз."
          : "Не удалось создать источник. Попробуйте ещё раз.",
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const formTitle =
    mode === "edit" ? "Редактировать источник" : "Создать источник";
  const finalSubmitLabel =
    submitLabel ?? (mode === "edit" ? "Сохранить изменения" : "Создать источник");

  return (
    <FormScreenLayout title={formTitle}>
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      <View style={styles.formCard}>
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
                placeholder="Книга игрока"
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
                placeholder="Player's Handbook"
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
                placeholder="Описание источника (например, базовая книга правил D&D 5e)"
                multiline
                style={[styles.input, styles.textArea]}
                placeholderTextColor={colors.inputPlaceholder}
              />
            )}
          />
          <FormErrorText>{errors.description?.message}</FormErrorText>
        </View>

        <FormSubmitButton
          title={finalSubmitLabel}
          isSubmitting={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </FormScreenLayout>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderMuted,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    rowGap: 16,
  },
  field: {
    rowGap: 6,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.borderMuted,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
});
