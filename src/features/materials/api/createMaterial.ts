import { apiClient } from '@/shared/api/client';

import { getMaterialById } from './getMaterialById';
import type { Material, MaterialCreateInput } from './types';

export async function createMaterial(payload: MaterialCreateInput): Promise<Material> {
  const response = await apiClient.post<string>('/api/v1/materials', payload);
  const newId = response.data;
  const created = await getMaterialById(newId);
  return created;
}
