// app/(tabs)/library/spells/create.tsx
import { useRouter } from "expo-router";
import React from "react";

import { SpellForm } from "@/features/spells/components/SpellForm";

export default function SpellCreateScreen() {
  const router = useRouter();

  return (
    <SpellForm
      mode="create"
      submitLabel="Создать заклинание"
      onSuccess={() => {
        router.replace("/(tabs)/library/spells");
      }}
    />
  );
}
