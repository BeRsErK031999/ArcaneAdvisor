import React from "react";
import { useQuery } from "@tanstack/react-query";

import { getSpellSchools, type SpellSchoolsResponse } from "./getSpellSchools";

export interface SpellSchoolOption {
  id: string;
  label: string;
}

export function useSpellSchools() {
  const {
    data: spellSchools,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SpellSchoolsResponse, Error>({
    queryKey: ["spellSchools"],
    queryFn: getSpellSchools,
  });

  const schools = React.useMemo<SpellSchoolOption[]>(
    () =>
      Object.entries(spellSchools ?? {})
        .map(([id, label]) => ({ id, label: label || id }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [spellSchools],
  );

  return {
    schools,
    isLoading,
    isError,
    error,
    refetch,
  };
}
