import { apiClient } from '@/shared/api/client';
import type { ClassLevel } from './types';

export async function getClassLevels(): Promise<ClassLevel[]> {
  const response = await apiClient.get<ClassLevel[]>('/api/v1/class-levels');
  return response.data;
}
