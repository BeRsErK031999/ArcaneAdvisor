import { apiClient } from '@/shared/api/client';
import type { WeaponCreateInput } from './types';

export async function updateWeapon(
  weaponId: string,
  payload: WeaponCreateInput,
): Promise<void> {
  await apiClient.put(`/api/v1/weapons/${weaponId}`, payload);
}
