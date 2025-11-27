import { apiClient } from '@/shared/api/client';
import type { Spell, SpellCreateInput } from './types';

export async function createSpell(payload: SpellCreateInput): Promise<Spell> {
  const response = await apiClient.post<Spell>('/api/v1/spells', payload);
  return response.data;
}
