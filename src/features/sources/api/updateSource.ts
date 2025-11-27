import { apiClient } from "@/shared/api/client";
import type { SourceUpdateInput, Source } from "./types";

export async function updateSource(
  sourceId: string,
  payload: SourceUpdateInput,
): Promise<Source> {
  const { data } = await apiClient.put<Source>(
    `/api/v1/sources/${sourceId}`,
    payload,
  );
  return data;
}
