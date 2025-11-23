import { apiClient } from '@/shared/api/client';
import type { LengthUnits } from './types';

export async function getLengthUnits(): Promise<LengthUnits> {
  const response = await apiClient.get<LengthUnits>('/api/v1/lengths/units');
  return response.data;
}
