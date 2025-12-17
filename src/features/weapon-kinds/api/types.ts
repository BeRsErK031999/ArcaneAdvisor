import { z } from 'zod';

export interface WeaponKind {
  weapon_kind_id: string;
  weapon_type: string;
  name: string;
  description: string;
}

export interface WeaponTypeOptionsMap {
  simple_range: string;
  simple_melee: string;
  martial_range: string;
  martial_melee: string;
  [key: string]: string;
}

export interface WeaponTypeOption {
  key: string;
  label: string;
}

export const WeaponKindCreateSchema = z.object({
  weapon_type: z.string().min(1, 'Укажите тип оружия'),
  name: z
    .string()
    .min(1, 'Название обязательно')
    .max(80, 'Название не должно превышать 80 символов'),
  description: z
    .string()
    .max(2000, 'Описание не должно превышать 2000 символов')
    .optional()
    .or(z.literal('')),
});

export type WeaponKindCreateInput = z.infer<typeof WeaponKindCreateSchema>;
