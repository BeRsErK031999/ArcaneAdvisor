import { apiClient } from '@/shared/api/client';
import type { WeaponKind } from './types';

interface GetWeaponKindsParams {
  search_by_name?: string;
  filter_by_types?: string[];
}

export async function getWeaponKinds(
  params?: GetWeaponKindsParams,
): Promise<WeaponKind[]> {
  const response = await apiClient.get<WeaponKind[]>('/api/v1/weapon-kinds', {
    params: {
      search_by_name: params?.search_by_name,
      filter_by_types: params?.filter_by_types,
    },
  });

  return response.data;
}
