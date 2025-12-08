import { apiClient } from '@/shared/api/client';
import type { WeaponProperty } from './types';

interface GetWeaponPropertiesParams {
  search_by_name?: string;
}

export async function getWeaponProperties(
  params?: GetWeaponPropertiesParams,
): Promise<WeaponProperty[]> {
  const response = await apiClient.get<WeaponProperty[]>('/api/v1/weapon-properties', {
    params: {
      search_by_name: params?.search_by_name,
    },
  });

  return response.data;
}
