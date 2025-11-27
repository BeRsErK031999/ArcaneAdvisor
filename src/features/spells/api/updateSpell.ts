import { apiClient } from '@/shared/api/client';
import type { Spell, SpellCreateInput } from './types';

export async function updateSpell(spellId: string, payload: SpellCreateInput): Promise<Spell> {
  const response = await apiClient.put<Spell>(`/api/v1/spells/${spellId}`, payload);
  return response.data;
}
