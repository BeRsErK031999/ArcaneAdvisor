import { apiClient } from '@/shared/api/client';
import type { Feat } from './types';

export async function getFeats(): Promise<Feat[]> {
  const response = await apiClient.get<Feat[]>('/api/v1/feats');
  return response.data;
}
