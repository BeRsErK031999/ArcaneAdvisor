import { apiClient } from '@/shared/api/client';
import { getFeatById } from './getFeatById';
import type { Feat, FeatCreateInput } from './types';

export async function createFeat(payload: FeatCreateInput): Promise<Feat> {
  const response = await apiClient.post<string>('/api/v1/feats', payload);
  const createdId = response.data;
  return getFeatById(createdId);
}
