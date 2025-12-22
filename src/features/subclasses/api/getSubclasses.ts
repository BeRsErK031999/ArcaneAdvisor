import { apiClient } from "@/shared/api/client";
import type { Subclass } from "./types";

export async function getSubclasses(params: { filter_by_class_id: string }): Promise<Subclass[]> {
  const response = await apiClient.get<Subclass[]>("/api/v1/subclasses", {
    params: { filter_by_class_id: params.filter_by_class_id },
  });
  return response.data;
}
