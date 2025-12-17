import { apiClient } from '@/shared/api/client';

export async function deleteArmor(armorId: string): Promise<void> {
  await apiClient.delete(`/api/v1/armors/${armorId}`);
}
