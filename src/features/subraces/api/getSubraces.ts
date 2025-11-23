import { apiClient } from '@/shared/api/client';
import type { Subrace } from './types';

export async function getSubraces(): Promise<Subrace[]> {
  const response = await apiClient.get<Subrace[]>('/api/v1/subraces');
  return response.data;
}
