import { apiClient } from '@/shared/api/client';
import type { ToolCreateInput } from './types';

export async function updateTool(toolId: string, payload: ToolCreateInput): Promise<void> {
  await apiClient.put(`/api/v1/tools/${toolId}`, payload);
}
