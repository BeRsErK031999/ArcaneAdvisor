import { z } from 'zod';

export interface FeatRequiredModifier {
  modifier: string;
  min_value: number;
}

export const FeatRequiredModifierSchema = z.object({
  modifier: z.string().min(1, 'Название характеристики обязательно'),
  min_value: z.number().int().min(1, 'Минимальное значение должно быть ≥ 1'),
});

export const FeatCreateSchema = z.object({
  name: z.string().trim().min(1, 'Название способности обязательно'),
  description: z.string().trim().min(1, 'Описание обязательно'),
  caster: z.boolean().default(false),
  required_armor_types: z.array(z.string()).default([]),
  required_modifiers: z.array(FeatRequiredModifierSchema).default([]),
  increase_modifiers: z.array(z.string()).default([]),
});

export type FeatCreateInput = z.infer<typeof FeatCreateSchema>;

export interface Feat {
  feat_id: string;
  name: string;
  description: string;
  caster: boolean;
  required_armor_types: string[];
  required_modifiers: FeatRequiredModifier[];
  increase_modifiers: string[];
}
