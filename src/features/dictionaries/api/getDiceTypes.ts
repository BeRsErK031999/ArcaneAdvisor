import { apiClient } from '@/shared/api/client';
import type { DiceTypes } from './types';

export async function getDiceTypes(): Promise<DiceTypes> {
  const response = await apiClient.get<DiceTypes>('/api/v1/dices/types');
  return response.data;
}
