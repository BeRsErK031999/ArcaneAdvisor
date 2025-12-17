import { apiClient } from '@/shared/api/client';

import { getMaterialComponentById } from './getMaterialComponentById';
import type { MaterialComponent, MaterialComponentCreateInput } from './types';

export async function createMaterialComponent(
  payload: MaterialComponentCreateInput,
): Promise<MaterialComponent> {
  const response = await apiClient.post<string>('/api/v1/material-components', payload);
  const newId = response.data;
  const created = await getMaterialComponentById(newId);
  return created;
}
