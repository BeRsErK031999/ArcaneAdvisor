import { apiClient } from '@/shared/api/client';
import type { Subrace } from './types';

export async function getSubraceById(subraceId: string): Promise<Subrace> {
  const response = await apiClient.get<Subrace>(`/api/v1/subraces/${subraceId}`);
  return response.data;
}
