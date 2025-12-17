import { z } from 'zod';

export const CoinSchema = z.object({
  count: z
    .number({ required_error: 'Стоимость обязательна' })
    .int('Стоимость должна быть целым числом')
    .min(1, 'Стоимость должна быть не меньше 1'),
  piece_type: z.enum(['cp', 'sp', 'gp', 'pp'], { required_error: 'Тип монеты обязателен' }),
});

export type Coin = z.infer<typeof CoinSchema>;

export interface MaterialComponent {
  material_component_id: string;
  name: string;
  description: string;
  material_id: string | null;
  cost: Coin | null;
  consumed: boolean;
}

export const MaterialComponentCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().default(''),
  material_id: z.string().nullable(),
  cost: CoinSchema.nullable(),
  consumed: z.boolean().default(false),
});

export type MaterialComponentCreateInput = z.infer<typeof MaterialComponentCreateSchema>;
