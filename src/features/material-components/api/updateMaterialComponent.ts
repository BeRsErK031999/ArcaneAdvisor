import { apiClient } from '@/shared/api/client';

import type { MaterialComponentCreateInput } from './types';

export async function updateMaterialComponent(
  materialComponentId: string,
  payload: MaterialComponentCreateInput,
): Promise<void> {
  await apiClient.put(`/api/v1/material-components/${materialComponentId}`, payload);
}
