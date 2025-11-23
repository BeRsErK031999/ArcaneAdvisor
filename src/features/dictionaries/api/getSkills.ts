import { apiClient } from '@/shared/api/client';
import type { Skills } from './types';

export async function getSkills(): Promise<Skills> {
  const response = await apiClient.get<Skills>('/api/v1/skills');
  return response.data;
}
