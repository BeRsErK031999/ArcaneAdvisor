import { apiClient } from '@/shared/api/client';
import type { WeaponKind, WeaponKindCreateInput } from './types';
import { getWeaponKindById } from './getWeaponKindById';

export async function createWeaponKind(
  payload: WeaponKindCreateInput,
): Promise<WeaponKind> {
  const response = await apiClient.post<string>('/api/v1/weapon-kinds', payload);
  const newId = response.data;
  const created = await getWeaponKindById(newId);
  return created;
}
