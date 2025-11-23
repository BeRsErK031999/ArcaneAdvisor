import { apiClient } from '@/shared/api/client';
import type { PieceTypes } from './types';

export async function getPieceTypes(): Promise<PieceTypes> {
  const response = await apiClient.get<PieceTypes>('/api/v1/coins/piece-types');
  return response.data;
}
