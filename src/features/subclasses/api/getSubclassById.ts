import { apiClient } from '@/shared/api/client';
import type { Subclass } from './types';

export async function getSubclassById(subclassId: string): Promise<Subclass> {
  const response = await apiClient.get<Subclass>(`/api/v1/subclasses/${subclassId}`);
  return response.data;
}
