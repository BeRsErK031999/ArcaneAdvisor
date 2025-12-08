import { apiClient } from '@/shared/api/client';

export async function deleteWeaponProperty(weaponPropertyId: string): Promise<void> {
  await apiClient.delete(`/api/v1/weapon-properties/${weaponPropertyId}`);
}
