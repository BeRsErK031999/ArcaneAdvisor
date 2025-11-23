import { apiClient } from '@/shared/api/client';
import type { SpellCreateInput } from './types';

export async function createSpell(payload: SpellCreateInput): Promise<void> {
  await apiClient.post('/api/v1/spells', payload);
}
