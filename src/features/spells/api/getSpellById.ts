import { apiClient } from '@/shared/api/client';

import type { Spell } from './types';

export async function getSpellById(spellId: string): Promise<Spell> {
  const response = await apiClient.get<Spell>(`/api/v1/spells/${spellId}`);
  return response.data;
}
