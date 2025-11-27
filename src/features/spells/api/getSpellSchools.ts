import { apiClient } from "@/shared/api/client";
import type { SpellSchoolId } from "./types";

export async function getSpellSchools(): Promise<SpellSchoolId[]> {
  const { data } = await apiClient.get<SpellSchoolId[]>(
    "/api/v1/spells/schools",
  );
  return data;
}
