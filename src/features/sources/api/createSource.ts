import { apiClient } from "@/shared/api/client";
import type { SourceCreateInput, Source } from "./types";

export async function createSource(payload: SourceCreateInput): Promise<Source> {
  const { data } = await apiClient.post<Source>("/api/v1/sources", payload);
  return data;
}
