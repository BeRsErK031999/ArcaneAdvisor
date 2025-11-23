import { apiClient } from '@/shared/api/client';
import type { WeaponProperty } from './types';

export async function getWeaponProperties(): Promise<WeaponProperty[]> {
  const response = await apiClient.get<WeaponProperty[]>('/api/v1/weapon-properties');
  return response.data;
}
