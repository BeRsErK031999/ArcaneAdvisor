import { apiClient } from '@/shared/api/client';
import type { Feat } from './types';

export async function getFeatById(featId: string): Promise<Feat> {
  const response = await apiClient.get<Feat>(`/api/v1/feats/${featId}`);
  return response.data;
}
