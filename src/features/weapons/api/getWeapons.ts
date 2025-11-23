import { apiClient } from '@/shared/api/client';
import type { Weapon } from './types';

export async function getWeapons(): Promise<Weapon[]> {
  const response = await apiClient.get<Weapon[]>('/api/v1/weapons');
  return response.data;
}
