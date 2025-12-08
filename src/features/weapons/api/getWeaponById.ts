import { apiClient } from '@/shared/api/client';
import type { Weapon } from './types';

export async function getWeaponById(weaponId: string): Promise<Weapon> {
  const response = await apiClient.get<Weapon>(`/api/v1/weapons/${weaponId}`);
  return response.data;
}
