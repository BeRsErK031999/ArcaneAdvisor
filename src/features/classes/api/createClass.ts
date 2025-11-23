import { apiClient } from '@/shared/api/client';
import type { ClassCreateInput } from './types';

export async function createClass(payload: ClassCreateInput): Promise<void> {
  await apiClient.post('/api/v1/classes', payload);
}
