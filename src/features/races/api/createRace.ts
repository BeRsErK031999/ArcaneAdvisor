import { apiClient } from '@/shared/api/client';
import type { RaceCreateInput } from './types';

export async function createRace(payload: RaceCreateInput): Promise<void> {
  await apiClient.post('/api/v1/races', payload);
}
