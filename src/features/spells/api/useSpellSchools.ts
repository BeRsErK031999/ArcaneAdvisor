import React from "react";
import { useQuery } from "@tanstack/react-query";

import { getSpells } from "./getSpells";
import type { Spell } from "./types";

export function useSpellSchools() {
  const {
    data: spells,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Spell[], Error>({
    queryKey: ["spells"],
    queryFn: getSpells,
  });

  const schools = React.useMemo(
    () =>
      Array.from(
        new Set(
          (spells ?? [])
            .map((spell) => spell.school)
            .filter((school): school is string => Boolean(school)),
        ),
      ).sort(),
    [spells],
  );

  return {
    schools,
    isLoading,
    isError,
    error,
    refetch,
  };
}
