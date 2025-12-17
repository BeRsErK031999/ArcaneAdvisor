import { apiClient } from '@/shared/api/client';

import { getArmorById } from './getArmorById';
import type { Armor, ArmorCreateInput } from './types';

interface CreateArmorResponse {
  armor_id?: string;
  id?: string;
}

export async function createArmor(payload: ArmorCreateInput): Promise<Armor> {
  const response = await apiClient.post<CreateArmorResponse>('/api/v1/armors', payload);
  const newId = response.data?.armor_id ?? response.data?.id;

  if (!newId) {
    throw new Error('Не удалось получить идентификатор доспеха после создания');
  }

  return getArmorById(newId);
}
