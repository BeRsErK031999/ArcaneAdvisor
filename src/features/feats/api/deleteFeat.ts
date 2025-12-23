import { apiClient } from '@/shared/api/client';

export async function deleteFeat(featId: string): Promise<void> {
  await apiClient.delete(`/api/v1/feats/${featId}`);
}
