import { apiClient } from '@/shared/api/client';
import type { DamageTypes } from './types';

export async function getDamageTypes(): Promise<DamageTypes> {
  const response = await apiClient.get<DamageTypes>('/api/v1/damage-types');
  return response.data;
}
