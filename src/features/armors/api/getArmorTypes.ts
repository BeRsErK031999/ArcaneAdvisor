import { apiClient } from '@/shared/api/client';

export interface ArmorTypeOption {
  key: string;
  label: string;
}

interface ArmorTypesResponse {
  [key: string]: string;
}

export async function getArmorTypes(): Promise<ArmorTypeOption[]> {
  const response = await apiClient.get<ArmorTypesResponse>('/api/v1/armors/types');
  const entries = Object.entries(response.data ?? {});

  return entries.map(([key, label]) => ({
    key,
    label,
  }));
}
