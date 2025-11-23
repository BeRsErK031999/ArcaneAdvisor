import { apiClient } from '@/shared/api/client';
import type { MaterialComponent } from './types';

export async function getMaterialComponents(): Promise<MaterialComponent[]> {
  const response = await apiClient.get<MaterialComponent[]>('/api/v1/material-components');
  return response.data;
}
