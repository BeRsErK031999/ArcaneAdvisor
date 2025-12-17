import { apiClient } from '@/shared/api/client';

import type { ArmorCreateInput } from './types';

export async function updateArmor(armorId: string, payload: ArmorCreateInput): Promise<void> {
  await apiClient.put(`/api/v1/armors/${armorId}`, payload);
}
