import { apiClient } from '@/shared/api/client';
import type { ClassFeature } from './types';

export async function getClassFeatures(): Promise<ClassFeature[]> {
  const response = await apiClient.get<ClassFeature[]>('/api/v1/class-features');
  return response.data;
}
