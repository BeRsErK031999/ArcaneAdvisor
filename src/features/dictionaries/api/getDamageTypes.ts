import { apiClient } from '@/shared/api/client';
import type { DamageTypesResponse } from './types';

export async function getDamageTypes(): Promise<DamageTypesResponse> {
  const response = await apiClient.get<DamageTypesResponse>('/api/v1/damage-types');
  return response.data;
}
