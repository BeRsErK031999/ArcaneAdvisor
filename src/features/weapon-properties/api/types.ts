import { z } from 'zod';

// Внутренние структуры
export interface RangeValue {
  count: number;
  unit: string; // значения из /api/v1/lengths/units, например 'ft' или 'm'
}

export interface DiceValue {
  count: number;
  dice_type: string; // значения из /api/v1/dices/types, например 'd6', 'd8'
}

// Основная модель свойства оружия
export interface WeaponProperty {
  weapon_property_id: string;
  name: string; // ключ свойства (например, 'light', 'finesse')
  description: string;

  base_range:
    | {
        range: RangeValue;
      }
    | null;

  max_range:
    | {
        range: RangeValue;
      }
    | null;

  second_hand_dice:
    | {
        dice: DiceValue;
      }
    | null;
}

// Словарь имён свойств из /weapon-properties/names
export interface WeaponPropertyNamesMap {
  ammunition: string;
  finesse: string;
  heavy: string;
  light: string;
  reach: string;
  special: string;
  thrown: string;
  two_handed: string;
  versatile: string;
  distance: string;
  // Если на бэке больше ключей — можно описать [key: string]: string;
  [key: string]: string;
}

export interface WeaponPropertyNameOption {
  key: string; // 'light'
  label: string; // текст из API
}

// Zod-схема формы создания/редактирования
const RangeSchema = z.object({
  count: z.number().nonnegative(),
  unit: z.string().min(1),
});

const DiceSchema = z.object({
  count: z.number().positive(),
  dice_type: z.string().min(1),
});

export const WeaponPropertyCreateSchema = z.object({
  name: z.string().min(1, 'Укажите ключ свойства (например, "light")'),
  description: z.string().default(''),

  base_range: z
    .object({
      range: RangeSchema,
    })
    .nullable(),

  max_range: z
    .object({
      range: RangeSchema,
    })
    .nullable(),

  second_hand_dice: z
    .object({
      dice: DiceSchema,
    })
    .nullable(),
});

export type WeaponPropertyCreateInput = z.infer<typeof WeaponPropertyCreateSchema>;
