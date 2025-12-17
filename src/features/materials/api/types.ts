import { z } from 'zod';

export const WeightSchema = z.object({
  count: z
    .number({ required_error: 'Вес обязателен' })
    .int('Вес должен быть целым числом')
    .min(1, 'Вес должен быть не меньше 1'),
  unit: z.string().min(1, 'Единица веса обязательна'),
});

export type Weight = z.infer<typeof WeightSchema>;

export const CoinSchema = z.object({
  count: z
    .number({ required_error: 'Стоимость обязательна' })
    .int('Стоимость должна быть целым числом')
    .min(1, 'Стоимость должна быть не меньше 1'),
  piece_type: z.enum(['cp', 'sp', 'gp', 'pp'], {
    required_error: 'Тип монеты обязателен',
  }),
});

export type Coin = z.infer<typeof CoinSchema>;

export interface Material {
  material_id: string;
  name: string;
  description: string;
  rarity: string;
  weight: Weight | null;
  cost: Coin | null;
  source_id: string;
}

export const MaterialCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  rarity: z.string().min(1, 'Редкость обязательна'),
  source_id: z.string().min(1, 'Источник обязателен'),
  description: z.string().default(''),
  weight: WeightSchema.nullable(),
  cost: CoinSchema.nullable(),
});

export type MaterialCreateInput = z.infer<typeof MaterialCreateSchema>;
