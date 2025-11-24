import { apiClient } from '@/shared/api/client';
import type { SubclassCreateInput } from './types';

export async function createSubclass(payload: SubclassCreateInput): Promise<void> {
  await apiClient.post('/api/v1/subclasses', payload);
}
