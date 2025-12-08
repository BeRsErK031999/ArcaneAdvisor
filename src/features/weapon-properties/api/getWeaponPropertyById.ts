import { apiClient } from '@/shared/api/client';
import type { WeaponProperty } from './types';

export async function getWeaponPropertyById(
  weaponPropertyId: string,
): Promise<WeaponProperty> {
  const response = await apiClient.get<WeaponProperty>(
    `/api/v1/weapon-properties/${weaponPropertyId}`,
  );
  return response.data;
}
