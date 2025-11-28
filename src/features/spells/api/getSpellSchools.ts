import { apiClient } from "@/shared/api/client";

export type SpellSchoolsResponse = Record<string, string>;

export async function getSpellSchools(): Promise<SpellSchoolsResponse> {
  const response = await apiClient.get<SpellSchoolsResponse>(
    "/api/v1/spells/schools",
  );
  return response.data;
}
