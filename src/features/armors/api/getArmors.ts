import { apiClient } from '@/shared/api/client';
import type { Armor } from './types';

export async function getArmors(): Promise<Armor[]> {
  const response = await apiClient.get<Armor[]>('/api/v1/armors');
  return response.data;
}
