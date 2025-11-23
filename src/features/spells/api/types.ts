import { z } from 'zod';

export const SpellCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  next_level_description: z.string().optional().default(''),
  level: z
    .number()
    .int()
    .min(0, 'Уровень от 0 до 9')
    .max(9, 'Уровень от 0 до 9'),
  school: z.string().min(1, 'Школа обязательна'),
  concentration: z.boolean().default(false),
  ritual: z.boolean().default(false),
  class_ids: z.array(z.string()).default([]),
  subclass_ids: z.array(z.string()).default([]),
  saving_throws: z.array(z.string()).default([]),
  damage_type: z
    .object({
      name: z.string().nullable(),
    })
    .nullable()
    .default(null),
  casting_time: z.object({
    count: z.number().int().min(1),
    unit: z.string().min(1),
  }),
  duration: z
    .object({
      game_time: z
        .object({
          count: z.number().int().min(0),
          unit: z.string().min(1),
        })
        .nullable(),
    })
    .nullable()
    .default(null),
  spell_range: z.object({
    count: z.number().int().min(0),
    unit: z.string().min(1),
  }),
  splash: z
    .object({
      splash: z
        .object({
          count: z.number().int().min(0),
          unit: z.string().min(1),
        })
        .nullable(),
    })
    .nullable()
    .default(null),
  components: z.object({
    verbal: z.boolean().default(false),
    symbolic: z.boolean().default(false),
    material: z.boolean().default(false),
    materials: z.array(z.string()).default([]),
  }),
  name_in_english: z.string().optional().default(''),
  source_id: z.string().uuid().optional().or(z.literal('')).default(''),
});

export type SpellCreateInput = z.infer<typeof SpellCreateSchema>;

export interface GameTime {
  count: number;
  unit: string;
}

export interface Length {
  count: number;
  unit: string;
}

export interface SpellDamageType {
  name: string | null;
}

export interface SpellDuration {
  game_time: GameTime | null;
}

export interface Splash {
  splash: GameTime | null;
}

export interface SpellComponents {
  verbal: boolean;
  symbolic: boolean;
  material: boolean;
  materials: string[];
}

export interface Spell {
  spell_id: string;
  class_ids: string[];
  subclass_ids: string[];
  name: string;
  description: string;
  next_level_description: string;
  level: number;
  school: string;
  damage_type: SpellDamageType | null;
  duration: SpellDuration | null;
  casting_time: GameTime;
  spell_range: Length;
  splash: Splash | null;
  components: SpellComponents;
  concentration: boolean;
  ritual: boolean;
  saving_throws: string[];
  name_in_english: string;
  source_id: string;
}
