import { apiClient } from '@/shared/api/client';
import type { SpellCreateInput } from './types';

export async function updateSpell(spellId: string, payload: SpellCreateInput): Promise<void> {
  await apiClient.put(`/api/v1/spells/${spellId}`, payload);
}
