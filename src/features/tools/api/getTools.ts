import { apiClient } from '@/shared/api/client';
import type { Tool } from './types';

export async function getTools(): Promise<Tool[]> {
  const response = await apiClient.get<Tool[]>('/api/v1/tools');
  return response.data;
}
