import { apiClient } from '@/shared/api/client';

export async function deleteSpell(spellId: string): Promise<void> {
  await apiClient.delete(`/api/v1/spells/${spellId}`);
}
