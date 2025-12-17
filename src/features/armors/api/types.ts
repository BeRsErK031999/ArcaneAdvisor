import { z } from 'zod';

export interface ArmorClass {
  base_class: number;
  modifier: string | null;
  max_modifier_bonus: number | null;
}

export interface Weight {
  count: number;
  unit: string;
}

export interface Coin {
  count: number;
  piece_type: string;
}

export interface Armor {
  armor_id: string;
  armor_type: string;
  name: string;
  description: string;
  armor_class: ArmorClass;
  strength: number;
  stealth: boolean;
  weight: Weight | null;
  cost: Coin | null;
  material_id: string | null;
}

export const CoinSchema = z.object({
  count: z
    .number({ required_error: 'Стоимость обязательна' })
    .int('Стоимость должна быть целым числом')
    .min(1, 'Стоимость должна быть не меньше 1'),
  piece_type: z.string().min(1, 'Выберите тип монеты'),
});

export const WeightSchema = z.object({
  count: z
    .number({ required_error: 'Вес обязателен' })
    .int('Вес должен быть целым числом')
    .min(1, 'Вес должен быть не меньше 1'),
  unit: z.string().min(1, 'Единица веса обязательна'),
});

export const ArmorClassSchema = z.object({
  base_class: z
    .number({ required_error: 'Базовый класс обязателен' })
    .int('Класс должен быть целым числом')
    .min(1, 'Базовый класс должен быть не меньше 1'),
  modifier: z.string().min(1).nullable(),
  max_modifier_bonus: z
    .number({ required_error: 'Максимальный бонус обязателен' })
    .int('Бонус должен быть целым числом')
    .min(0, 'Бонус не может быть меньше 0')
    .nullable(),
});

export const ArmorCreateSchema = z.object({
  armor_type: z.string().min(1, 'Тип доспеха обязателен'),
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().default(''),
  armor_class: ArmorClassSchema,
  strength: z
    .number({ required_error: 'Требование силы обязательно' })
    .int('Требование силы должно быть целым числом')
    .min(0, 'Требование силы не может быть отрицательным'),
  stealth: z.boolean(),
  weight: WeightSchema.nullable(),
  cost: CoinSchema.nullable(),
  material_id: z.string().min(1).nullable(),
});

export type ArmorCreateInput = z.infer<typeof ArmorCreateSchema>;
export type ArmorClassInput = z.infer<typeof ArmorClassSchema>;
export type WeightInput = z.infer<typeof WeightSchema>;
export type CoinInput = z.infer<typeof CoinSchema>;
