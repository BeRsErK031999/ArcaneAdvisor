import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { SourceForm } from "@/features/sources/components/SourceForm";
import { getSources } from "@/features/sources/api/getSources";
import type {
  Source,
  SourceCreateInput,
} from "@/features/sources/api/types";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText } from "@/shared/ui/Typography";
import { colors } from "@/shared/theme/colors";

export default function SourceEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sourceId?: string }>();
  const sourceId = params.sourceId;

  if (!sourceId) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Не указан идентификатор источника.</BodyText>
      </ScreenContainer>
    );
  }

  const { data, isLoading, isError, error } = useQuery<Source[], Error>({
    queryKey: ["sources"],
    queryFn: getSources,
  });

  if (isLoading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
        <BodyText style={styles.helperText}>Загружаю источник…</BodyText>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText style={styles.errorText}>Не удалось загрузить источник</BodyText>
        {error?.message ? (
          <BodyText style={styles.errorDetails}>{error.message}</BodyText>
        ) : null}
      </ScreenContainer>
    );
  }

  const source = data.find((item) => item.source_id === sourceId);

  if (!source) {
    return (
      <ScreenContainer style={styles.centered}>
        <BodyText>Источник не найден.</BodyText>
      </ScreenContainer>
    );
  }

  const initialValues: SourceCreateInput = {
    name: source.name,
    description: source.description,
    name_in_english: source.name_in_english,
  };

  return (
    <SourceForm
      mode="edit"
      sourceId={sourceId}
      initialValues={initialValues}
      submitLabel="Сохранить изменения"
      showBackButton
      onSuccess={() => {
        router.replace("/(tabs)/library/sources");
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 12,
  },
  helperText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  errorText: {
    color: colors.error,
    fontWeight: "600",
  },
  errorDetails: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
});
