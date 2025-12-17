import { z } from 'zod';

export interface Tool {
  tool_id: string;
  tool_type: string;
  name: string;
  description: string;

  cost: {
    count: number;
    piece_type: string;
  } | null;

  weight: {
    count: number;
    unit: string;
  } | null;

  utilizes: {
    action: string;
    complexity: number;
  }[];
}

const CoinSchema = z.object({
  count: z.number().int().min(1, 'Введите число больше 0'),
  piece_type: z.string().min(1, 'Выберите тип монеты'),
});

const WeightSchema = z.object({
  count: z.number().int().min(1, 'Введите число больше 0'),
  unit: z.string().min(1, 'Выберите единицу'),
});

export const ToolCreateSchema = z.object({
  tool_type: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),

  cost: CoinSchema.nullable(),

  weight: WeightSchema.nullable(),

  utilizes: z
    .array(
      z.object({
        action: z.string().min(1),
        complexity: z.number().int().min(1, 'Сложность должна быть больше 0'),
      }),
    )
    .min(1, 'Добавьте хотя бы одно действие'),
});

export type ToolCreateInput = z.infer<typeof ToolCreateSchema>;
