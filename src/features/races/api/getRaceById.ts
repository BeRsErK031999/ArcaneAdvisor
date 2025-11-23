import { apiClient } from '@/shared/api/client';
import type { Race } from './types';

export async function getRaceById(raceId: string): Promise<Race> {
  const response = await apiClient.get<Race>(`/api/v1/races/${raceId}`);
  return response.data;
}
