import { apiClient } from '@/shared/api/client';

export async function deleteWeapon(weaponId: string): Promise<void> {
  await apiClient.delete(`/api/v1/weapons/${weaponId}`);
}
