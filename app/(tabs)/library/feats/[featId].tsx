import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText } from "@/shared/ui/Typography";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function FeatDetailsScreen() {
  const params = useLocalSearchParams<{ featId?: string | string[] }>();

  const featIdParam = params.featId;
  const featId =
    typeof featIdParam === "string"
      ? featIdParam
      : Array.isArray(featIdParam)
      ? featIdParam[0]
      : undefined;

  if (!featId) {
    return (
      <ScreenContainer style={{ justifyContent: "center", alignItems: "center" }}>
        <BodyText>Не указан идентификатор способности.</BodyText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <BodyText>TODO: FeatDetails для {featId}</BodyText>
    </ScreenContainer>
  );
}
