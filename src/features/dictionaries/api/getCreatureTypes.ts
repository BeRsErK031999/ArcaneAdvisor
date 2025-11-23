import { apiClient } from '@/shared/api/client';
import type { CreatureTypes } from './types';

export async function getCreatureTypes(): Promise<CreatureTypes> {
  const response = await apiClient.get<CreatureTypes>('/api/v1/creatures/types');
  return response.data;
}
