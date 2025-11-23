import { z } from 'zod';

// Бросок кубика для ХП и других механик
export interface Dice {
  count: number;
  dice_type: string; // d6, d8, d10 и т.п.
}

// Хиты класса (по схеме ClassHitsSchema)
export interface ClassHits {
  hit_dice: Dice;
  starting_hits: number;
  hit_modifier: string;
  next_level_hits: number;
}

// Профициенции класса (ClassProficienciesSchema)
export interface ClassProficiencies {
  armors: string[];
  weapons: string[];
  tools: string[];
  saving_throws: string[];
  skills: string[];
  number_skills: number;
  number_tools: number;
}

export const ClassHitsSchema = z.object({
  hit_dice: z.object({
    count: z.number().int().min(1),
    dice_type: z.string().min(1),
  }),
  starting_hits: z.number().int().min(1),
  hit_modifier: z.string().min(1),
  next_level_hits: z.number().int().min(1),
});

export const ClassProficienciesSchema = z.object({
  armors: z.array(z.string()).default([]),
  weapons: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  saving_throws: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  number_skills: z.number().int().min(0).default(0),
  number_tools: z.number().int().min(0).default(0),
});

export const ClassCreateSchema = z.object({
  name: z.string().min(1, 'Название класса обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  primary_modifiers: z
    .array(z.string())
    .min(1, 'Нужно выбрать хотя бы одну основную характеристику'),
  hits: ClassHitsSchema,
  proficiencies: ClassProficienciesSchema,
  name_in_english: z.string().min(1, 'Английское название обязательно'),
  source_id: z.string().uuid('Некорректный UUID источника'),
});

export type ClassCreateInput = z.infer<typeof ClassCreateSchema>;

export interface Class {
  class_id: string;
  name: string;
  description: string;
  primary_modifiers: string[]; // STR, DEX, CHA и т.д.
  hits: ClassHits;
  proficiencies: ClassProficiencies;
  name_in_english: string;
  source_id: string;
}
