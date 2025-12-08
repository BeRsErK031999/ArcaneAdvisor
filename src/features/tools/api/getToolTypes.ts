import { apiClient } from '@/shared/api/client';

export interface ToolTypeOption {
  key: string;
  label: string;
}

interface ToolTypesResponse {
  [key: string]: string;
}

export async function getToolTypes(): Promise<ToolTypeOption[]> {
  const response = await apiClient.get<ToolTypesResponse>('/api/v1/tools/types');
  const entries = Object.entries(response.data ?? {});

  return entries.map(([key, label]) => ({
    key,
    label,
  }));
}
