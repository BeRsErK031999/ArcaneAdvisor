import React from "react";
import { useRouter } from "expo-router";

import { SourceForm } from "@/features/sources/components/SourceForm";

export default function SourceCreateScreen() {
  const router = useRouter();

  return (
    <SourceForm
      mode="create"
      submitLabel="Создать источник"
      showBackButton
      onSuccess={() => {
        router.replace("/(tabs)/library/sources");
      }}
    />
  );
}
