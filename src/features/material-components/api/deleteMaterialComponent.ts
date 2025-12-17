import { apiClient } from '@/shared/api/client';

export async function deleteMaterialComponent(materialComponentId: string): Promise<void> {
  await apiClient.delete(`/api/v1/material-components/${materialComponentId}`);
}
