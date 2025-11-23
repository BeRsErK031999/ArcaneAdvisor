import { apiClient } from '@/shared/api/client';
import type { Source } from './types';

export async function getSources(): Promise<Source[]> {
  const response = await apiClient.get<Source[]>('/api/v1/sources');
  return response.data;
}
