import { apiClient } from '@/shared/api/client';
import type { WeaponKindCreateInput } from './types';

export async function updateWeaponKind(
  weaponKindId: string,
  payload: WeaponKindCreateInput,
): Promise<void> {
  await apiClient.put(`/api/v1/weapon-kinds/${weaponKindId}`, payload);
}
