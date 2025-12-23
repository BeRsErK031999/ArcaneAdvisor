import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { getFeatById } from "@/features/feats/api/getFeatById";
import type { FeatCreateInput } from "@/features/feats/api/types";
import { FeatForm } from "@/features/feats/components/FeatForm";
import { colors } from "@/shared/theme/colors";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";

export default function FeatEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ featId?: string | string[] }>();

  const featIdParam = params.featId;
  const resolvedId =
    typeof featIdParam === "string"
      ? featIdParam
      : Array.isArray(featIdParam)
      ? featIdParam[0]
      : "";

  const {
    data: feat,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["feats", resolvedId],
    queryFn: () => getFeatById(resolvedId),
    enabled: Boolean(resolvedId),
  });

  if (!resolvedId) {
    return (
      <ScreenContainer style={{ justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.textPrimary }}>
          Не указан идентификатор способности.
        </Text>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.textSecondary} />
        <Text style={{ color: colors.textPrimary, marginTop: 8 }}>
          Загружаю способность...
        </Text>
      </ScreenContainer>
    );
  }

  if (isError || !feat) {
    console.error("Error loading feat for edit:", error);
    return (
      <ScreenContainer style={{ justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>
          Не удалось загрузить способность для редактирования.
        </Text>

        <Pressable onPress={() => refetch()}>
          <Text style={{ color: colors.buttonPrimary, textDecorationLine: "underline" }}>
            Повторить
          </Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const initialValues = feat as FeatCreateInput;

  return (
    <FeatForm
      mode="edit"
      featId={resolvedId}
      initialValues={initialValues}
      showBackButton
      onBackPress={() => router.back()}
      onSuccess={(updatedId) =>
        router.replace({
          pathname: "/(tabs)/library/feats/[featId]",
          params: { featId: updatedId },
        })
      }
      submitLabel="Сохранить изменения"
    />
  );
}
