import { apiClient } from '@/shared/api/client';
import type { SubclassCreateInput } from './types';

export async function updateSubclass(
  subclassId: string,
  payload: SubclassCreateInput,
): Promise<void> {
  await apiClient.put(`/api/v1/subclasses/${subclassId}`, payload);
}
