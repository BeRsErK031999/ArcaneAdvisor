import { apiClient } from '@/shared/api/client';
import { getFeatById } from './getFeatById';
import type { Feat, FeatCreateInput } from './types';

export async function updateFeat(featId: string, payload: FeatCreateInput): Promise<Feat> {
  await apiClient.put(`/api/v1/feats/${featId}`, payload);
  return getFeatById(featId);
}
