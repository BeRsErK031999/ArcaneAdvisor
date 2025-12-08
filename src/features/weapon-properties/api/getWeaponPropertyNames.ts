import { apiClient } from '@/shared/api/client';
import type { WeaponPropertyNameOption, WeaponPropertyNamesMap } from './types';

export async function getWeaponPropertyNames(): Promise<WeaponPropertyNameOption[]> {
  const response = await apiClient.get<WeaponPropertyNamesMap>(
    '/api/v1/weapon-properties/names',
  );

  const data = response.data;

  return Object.entries(data).map(([key, label]) => ({
    key,
    label,
  }));
}
