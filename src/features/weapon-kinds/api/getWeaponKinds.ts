import { apiClient } from '@/shared/api/client';
import type { WeaponKind } from './types';

export async function getWeaponKinds(): Promise<WeaponKind[]> {
  const response = await apiClient.get<WeaponKind[]>('/api/v1/weapon-kinds');
  return response.data;
}
