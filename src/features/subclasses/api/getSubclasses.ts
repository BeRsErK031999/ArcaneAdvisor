import { apiClient } from '@/shared/api/client';
import type { Subclass } from './types';

export async function getSubclasses(): Promise<Subclass[]> {
  const response = await apiClient.get<Subclass[]>('/api/v1/subclasses');
  return response.data;
}
