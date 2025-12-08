import { apiClient } from '@/shared/api/client';
import type { WeaponProperty, WeaponPropertyCreateInput } from './types';
import { getWeaponPropertyById } from './getWeaponPropertyById';

export async function createWeaponProperty(
  payload: WeaponPropertyCreateInput,
): Promise<WeaponProperty> {
  const response = await apiClient.post<string>('/api/v1/weapon-properties', payload);
  const newId = response.data;
  const created = await getWeaponPropertyById(newId);
  return created;
}
