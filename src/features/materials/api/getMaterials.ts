import { apiClient } from '@/shared/api/client';
import type { Material } from './types';

export async function getMaterials(): Promise<Material[]> {
  const response = await apiClient.get<Material[]>('/api/v1/materials');
  return response.data;
}
