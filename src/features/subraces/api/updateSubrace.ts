import { apiClient } from '@/shared/api/client';
import type { SubraceCreateInput } from './types';

export async function updateSubrace(
  subraceId: string,
  payload: SubraceCreateInput,
): Promise<void> {
  await apiClient.put(`/api/v1/subraces/${subraceId}`, payload);
}
