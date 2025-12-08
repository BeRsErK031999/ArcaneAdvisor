import { apiClient } from '@/shared/api/client';
import type { Material } from './types';

export async function getMaterialById(materialId: string): Promise<Material> {
  const response = await apiClient.get<Material>(`/api/v1/materials/${materialId}`);
  return response.data;
}
