import { apiClient } from '@/shared/api/client';
import type { WeaponTypeOptionsMap, WeaponTypeOption } from './types';

export async function getWeaponTypes(): Promise<WeaponTypeOption[]> {
  const response = await apiClient.get<WeaponTypeOptionsMap>(
    '/api/v1/weapons/types',
  );

  const data = response.data;

  return Object.entries(data).map(([key, label]) => ({
    key,
    label,
  }));
}
