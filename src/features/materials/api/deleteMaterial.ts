import { apiClient } from '@/shared/api/client';

export async function deleteMaterial(materialId: string): Promise<void> {
  await apiClient.delete(`/api/v1/materials/${materialId}`);
}
