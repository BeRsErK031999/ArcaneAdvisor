import { apiClient } from '@/shared/api/client';
import type { GameTimeUnits } from './types';

export async function getGameTimeUnits(): Promise<GameTimeUnits> {
  const response = await apiClient.get<GameTimeUnits>('/api/v1/game-times/units');
  return response.data;
}
