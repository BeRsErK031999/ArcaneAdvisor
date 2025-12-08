import { apiClient } from '@/shared/api/client';
import type { MaterialComponent } from './types';

export async function getMaterialComponentById(
  materialComponentId: string,
): Promise<MaterialComponent> {
  const response = await apiClient.get<MaterialComponent>(
    `/api/v1/material-components/${materialComponentId}`,
  );
  return response.data;
}
