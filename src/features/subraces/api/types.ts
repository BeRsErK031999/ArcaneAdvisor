import { z } from 'zod';

export interface SubraceIncreaseModifier {
  modifier: string;
  bonus: number;
}

export interface SubraceFeature {
  name: string;
  description: string;
}

export interface Subrace {
  subrace_id: string;
  race_id: string;
  name: string;
  description: string;
  increase_modifiers: SubraceIncreaseModifier[];
  name_in_english: string;
  features: SubraceFeature[];
}

export const SubraceIncreaseModifierSchema = z.object({
  modifier: z.string().min(1, 'Название характеристики обязательно'),
  bonus: z.number().int(),
});

export const SubraceFeatureSchema = z.object({
  name: z.string().min(1, 'Название особенности обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
});

export const SubraceCreateSchema = z.object({
  race_id: z.string().uuid('Некорректный UUID расы'),
  name: z.string().min(1, 'Название подрасы обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  increase_modifiers: z.array(SubraceIncreaseModifierSchema).default([]),
  name_in_english: z.string().min(1, 'Английское название обязательно'),
  features: z.array(SubraceFeatureSchema).default([]),
});

export type SubraceCreateInput = z.infer<typeof SubraceCreateSchema>;
