import { apiClient } from '@/shared/api/client';
import type { CreatureSizes } from './types';

export async function getCreatureSizes(): Promise<CreatureSizes> {
  const response = await apiClient.get<CreatureSizes>('/api/v1/creatures/sizes');
  return response.data;
}
