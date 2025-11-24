import { apiClient } from '@/shared/api/client';
import type { SubraceCreateInput } from './types';

export async function createSubrace(payload: SubraceCreateInput): Promise<void> {
  await apiClient.post('/api/v1/subraces', payload);
}
