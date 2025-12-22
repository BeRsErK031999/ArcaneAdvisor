import { apiClient } from '@/shared/api/client';
import { getSpellById } from './getSpellById';
import type { Spell, SpellCreateInput } from './types';

export async function createSpell(payload: SpellCreateInput): Promise<Spell> {
  const response = await apiClient.post<string>('/api/v1/spells', payload);
  const spellId = response.data;

  return getSpellById(spellId);
}
