import { apiClient } from "@/shared/api/client";

import { Spell } from "./types";

export interface GetSpellsParams {
  search_by_name?: string;
  filter_by_schools?: string[];
  filter_by_source_ids?: string[];
  filter_by_concentration?: boolean;
  filter_by_ritual?: boolean;
}

export async function getSpells(params?: GetSpellsParams): Promise<Spell[]> {
  const queryParams: Record<string, unknown> = {};

  if (params?.search_by_name?.trim()) {
    queryParams.search_by_name = params.search_by_name.trim();
  }

  if (params?.filter_by_schools && params.filter_by_schools.length > 0) {
    queryParams.filter_by_schools = params.filter_by_schools;
  }

  if (params?.filter_by_source_ids && params.filter_by_source_ids.length > 0) {
    queryParams.filter_by_source_ids = params.filter_by_source_ids;
  }

  if (params?.filter_by_concentration !== undefined) {
    queryParams.filter_by_concentration = params.filter_by_concentration;
  }

  if (params?.filter_by_ritual !== undefined) {
    queryParams.filter_by_ritual = params.filter_by_ritual;
  }

  const response = await apiClient.get<Spell[]>("/api/v1/spells", {
    params: queryParams,
  });
  return response.data;
}
