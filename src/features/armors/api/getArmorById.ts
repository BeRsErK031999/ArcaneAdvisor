import { apiClient } from '@/shared/api/client';

import type { Armor } from './types';

export async function getArmorById(armorId: string): Promise<Armor> {
  const response = await apiClient.get<Armor>(`/api/v1/armors/${armorId}`);
  return response.data;
}
