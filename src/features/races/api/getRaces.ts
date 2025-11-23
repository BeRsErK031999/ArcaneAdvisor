import { apiClient } from '@/shared/api/client';
import type { Race } from './types';

export async function getRaces(): Promise<Race[]> {
  const response = await apiClient.get<Race[]>('/api/v1/races');
  return response.data;
}
