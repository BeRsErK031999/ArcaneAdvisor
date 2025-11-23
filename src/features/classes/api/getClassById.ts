import { apiClient } from '@/shared/api/client';
import type { Class } from './types';

export async function getClassById(classId: string): Promise<Class> {
  const response = await apiClient.get<Class>(`/api/v1/classes/${classId}`);
  return response.data;
}
