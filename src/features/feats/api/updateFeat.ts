import { apiClient } from '@/shared/api/client';
import type { FeatCreateInput } from './types';

export async function updateFeat(featId: string, payload: FeatCreateInput): Promise<void> {
  await apiClient.put(`/api/v1/feats/${featId}`, payload);
}
