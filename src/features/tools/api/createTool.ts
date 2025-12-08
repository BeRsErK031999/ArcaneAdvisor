import { apiClient } from '@/shared/api/client';
import type { Tool, ToolCreateInput } from './types';
import { getToolById } from './getToolById';

interface CreateToolResponse {
  tool_id?: string;
  id?: string;
}

export async function createTool(payload: ToolCreateInput): Promise<Tool> {
  const response = await apiClient.post<CreateToolResponse>('/api/v1/tools', payload);
  const newId = response.data?.tool_id ?? response.data?.id;

  if (!newId) {
    throw new Error('Не удалось получить идентификатор инструмента после создания');
  }

  return getToolById(newId);
}
