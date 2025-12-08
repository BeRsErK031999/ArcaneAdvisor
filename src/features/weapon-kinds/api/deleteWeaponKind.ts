import { apiClient } from '@/shared/api/client';

export async function deleteWeaponKind(weaponKindId: string): Promise<void> {
  await apiClient.delete(`/api/v1/weapon-kinds/${weaponKindId}`);
}
