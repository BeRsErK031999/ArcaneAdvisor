import { apiClient } from '@/shared/api/client';

import { Spell } from './types';

export async function getSpells(): Promise<Spell[]> {
  const response = await apiClient.get<Spell[]>('/api/v1/spells');
  return response.data;
}
