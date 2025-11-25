import { apiClient } from '@/shared/api/client';
import type { ClassCreateInput } from './types';

export async function updateClass(classId: string, payload: ClassCreateInput): Promise<void> {
  await apiClient.put(`/api/v1/classes/${classId}`, payload);
}
