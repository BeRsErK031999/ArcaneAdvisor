import { z } from 'zod';

// Единица расстояния (ft, m)
export interface Length {
  count: number;
  unit: string; // ft, m
}

// RaceSpeedSchema
export interface RaceSpeed {
  base_speed: Length;
  description: string;
}

// RaceAgeSchema
export interface RaceAge {
  max_age: number;
  description: string;
}

// RaceIncreaseModifierSchema
export interface RaceIncreaseModifier {
  modifier: string; // strength, dexterity, etc.
  bonus: number;
}

// RaceFeatureSchema
export interface RaceFeature {
  name: string;
  description: string;
}

export interface Race {
  race_id: string;
  name: string;
  description: string;
  creature_type: string; // humanoid, beast, etc.
  creature_size: string; // small, medium, large, ...
  speed: RaceSpeed;
  age: RaceAge;
  increase_modifiers: RaceIncreaseModifier[];
  source_id: string;
  features: RaceFeature[];
  name_in_english: string;
}

// ��� Zod-схема для Length (единицы длины)
export const LengthSchema = z.object({
  count: z.number(),
  unit: z.string().min(1),
});

// ��� Zod-схема для скорости
export const RaceSpeedSchema = z.object({
  base_speed: LengthSchema,
  description: z.string().default(''),
});

// ��� Zod-схема для возраста
export const RaceAgeSchema = z.object({
  max_age: z
    .number()
    .int()
    .min(1, 'Максимальный возраст должен быть положительным'),
  description: z.string().default(''),
});

// ��� Zod-схема для модификаторов характеристик
export const RaceIncreaseModifierSchema = z.object({
  modifier: z.string().min(1, 'Название характеристики обязательно'),
  bonus: z.number().int(),
});

// ��� Zod-схема для особенностей расы
export const RaceFeatureSchema = z.object({
  name: z.string().min(1, 'Название особенности обязательно'),
  description: z.string().min(1, 'Описание особенности обязательно'),
});

// ��� Схема создания расы
export const RaceCreateSchema = z.object({
  name: z.string().min(1, 'Название расы обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  creature_type: z.string().min(1, 'Тип существа обязателен'),
  creature_size: z.string().min(1, 'Размер обязателен'),
  speed: RaceSpeedSchema,
  age: RaceAgeSchema,
  increase_modifiers: z.array(RaceIncreaseModifierSchema).default([]),
  source_id: z.string().uuid('Некорректный UUID источника'),
  features: z.array(RaceFeatureSchema).default([]),
  name_in_english: z.string().min(1, 'Английское название обязательно'),
});

// Тип для формы/создания
export type RaceCreateInput = z.infer<typeof RaceCreateSchema>;
