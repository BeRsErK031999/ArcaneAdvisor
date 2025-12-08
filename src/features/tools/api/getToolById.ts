import { apiClient } from '@/shared/api/client';
import type { Tool } from './types';

export async function getToolById(toolId: string): Promise<Tool> {
  const response = await apiClient.get<Tool>(`/api/v1/tools/${toolId}`);
  return response.data;
}
