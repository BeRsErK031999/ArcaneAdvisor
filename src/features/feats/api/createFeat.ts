import { apiClient } from '@/shared/api/client';
import type { FeatCreateInput } from './types';

export async function createFeat(payload: FeatCreateInput): Promise<void> {
  await apiClient.post('/api/v1/feats', payload);
}
