import { apiClient } from '@/shared/api/client';
import type { Modifiers } from './types';

export async function getModifiers(): Promise<Modifiers> {
  const response = await apiClient.get<Modifiers>('/api/v1/modifiers');
  return response.data;
}
