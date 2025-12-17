import { z } from 'zod';

export interface Weapon {
  weapon_id: string;
  weapon_kind_id: string;
  name: string;
  description: string;
  cost:
    | {
        count: number;
        piece_type: string;
      }
    | null;
  damage: {
    dice: { count: number; dice_type: string };
    damage_type: string;
    bonus_damage: number;
  };
  weight:
    | {
        count: number;
        unit: string;
      }
    | null;
  weapon_property_ids: string[];
  material_id: string;
}

export const WeaponCreateSchema = z.object({
  weapon_kind_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().default(''),
  cost: z
    .object({
      count: z.number().int().min(1, 'Введите число больше 0'),
      piece_type: z.string().min(1),
    })
    .nullable(),
  damage: z.object({
    dice: z.object({
      count: z.number().positive(),
      dice_type: z.string().min(1),
    }),
    damage_type: z.string().min(1),
    bonus_damage: z.number().int().default(0),
  }),
  weight: z
    .object({
      count: z.number().int().min(1, 'Введите число больше 0'),
      unit: z.string().min(1),
    })
    .nullable(),
  weapon_property_ids: z.array(z.string().uuid()),
  material_id: z.string().uuid(),
});

export type WeaponCreateInput = z.infer<typeof WeaponCreateSchema>;
