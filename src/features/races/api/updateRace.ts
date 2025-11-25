import { apiClient } from '@/shared/api/client';
import type { RaceCreateInput } from './types';

export async function updateRace(raceId: string, payload: RaceCreateInput): Promise<void> {
  await apiClient.put(`/api/v1/races/${raceId}`, payload);
}
