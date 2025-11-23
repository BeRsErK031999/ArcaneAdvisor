import { apiClient } from '@/shared/api/client';
import type { Class } from './types';

export async function getClasses(): Promise<Class[]> {
  const response = await apiClient.get<Class[]>('/api/v1/classes');
  return response.data;
}
