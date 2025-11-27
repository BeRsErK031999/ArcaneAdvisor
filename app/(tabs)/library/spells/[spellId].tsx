// app/(tabs)/library/spells/[spellId].tsx
import { useLocalSearchParams } from "expo-router";
import React from "react";

import { SpellDetails } from "@/features/spells/components/SpellDetails";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { BodyText } from "@/shared/ui/Typography";

export default function SpellDetailsScreen() {
  const params = useLocalSearchParams<{ spellId?: string | string[] }>();

  const spellIdParam = params.spellId;
  const spellId =
    typeof spellIdParam === "string"
      ? spellIdParam
      : Array.isArray(spellIdParam)
      ? spellIdParam[0]
      : undefined;

  if (!spellId) {
    return (
      <ScreenContainer
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <BodyText>Не указан идентификатор заклинания.</BodyText>
      </ScreenContainer>
    );
  }

  return <SpellDetails spellId={spellId} />;
}
