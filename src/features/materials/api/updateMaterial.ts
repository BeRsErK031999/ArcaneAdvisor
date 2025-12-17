import { apiClient } from '@/shared/api/client';

import type { MaterialCreateInput } from './types';

export async function updateMaterial(
  materialId: string,
  payload: MaterialCreateInput,
): Promise<void> {
  await apiClient.put(`/api/v1/materials/${materialId}`, payload);
}
