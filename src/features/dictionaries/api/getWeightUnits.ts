import { apiClient } from '@/shared/api/client';
import type { WeightUnits } from './types';

export async function getWeightUnits(): Promise<WeightUnits> {
  const response = await apiClient.get<WeightUnits>('/api/v1/weights/units');
  return response.data;
}
