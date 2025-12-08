import { apiClient } from '@/shared/api/client';

export async function deleteTool(toolId: string): Promise<void> {
  await apiClient.delete(`/api/v1/tools/${toolId}`);
}
