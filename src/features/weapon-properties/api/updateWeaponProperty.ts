import { apiClient } from '@/shared/api/client';
import type { WeaponPropertyCreateInput } from './types';

export async function updateWeaponProperty(
  weaponPropertyId: string,
  payload: WeaponPropertyCreateInput,
): Promise<void> {
  await apiClient.put(`/api/v1/weapon-properties/${weaponPropertyId}`, payload);
}
