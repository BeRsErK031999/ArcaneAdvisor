import { apiClient } from '@/shared/api/client';
import type { Weapon, WeaponCreateInput } from './types';
import { getWeaponById } from './getWeaponById';

export async function createWeapon(payload: WeaponCreateInput): Promise<Weapon> {
  const response = await apiClient.post<string>('/api/v1/weapons', payload);
  const id = response.data;
  return getWeaponById(id);
}
