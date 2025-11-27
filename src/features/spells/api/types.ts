import { z } from 'zod';

export interface SpellComponents {
  verbal: boolean;
  symbolic: boolean;
  material: boolean;
  materials: string[];
}

// SpellDamageTypeSchema: { name: string | null }
export interface SpellDamageType {
  name: string | null;
}

// GameTimeSchema: { count: integer; unit: string }
export interface GameTime {
  count: number;
  unit: string; // значения из ReadGameTimeUnitSchema: 'action', 'bonus_action', 'reaction', 'minute', 'hour'
}

// SpellDurationSchema: { game_time: GameTime | null }
export interface SpellDuration {
  game_time: GameTime | null;
}

// LengthSchema: { count: number; unit: string } (ft/m)
export interface Length {
  count: number;
  unit: string; // 'ft' | 'm'
}

// SplashSchema: { splash: Length | null } (область действия)
export interface Splash {
  splash: Length | null;
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

const GameTimeSchema = z.object({
  count: z.number().int(),
  unit: z.string(),
});

const LengthSchema = z.object({
  count: z.number(),
  unit: z.string(),
});

const SplashSchema = z.object({
  splash: LengthSchema.nullable(),
});

const SpellComponentsSchema = z.object({
  verbal: z.boolean(),
  symbolic: z.boolean(),
  material: z.boolean(),
  materials: z.array(z.string()),
});

const SpellDamageTypeSchema = z.object({
  name: z.string().nullable(),
});

const SpellDurationSchema = z.object({
  game_time: GameTimeSchema.nullable(),
});

export const SpellCreateSchema = z.object({
  class_ids: z.array(z.string().uuid()),
  subclass_ids: z.array(z.string().uuid()),
  name: z.string().min(1),
  description: z.string().min(1),
  next_level_description: z.string().default(''),
  level: z.number().int().min(0),
  school: z.string().min(1),
  damage_type: SpellDamageTypeSchema,
  duration: SpellDurationSchema,
  casting_time: GameTimeSchema,
  spell_range: LengthSchema,
  splash: SplashSchema,
  components: SpellComponentsSchema,
  concentration: z.boolean(),
  ritual: z.boolean(),
  saving_throws: z.array(z.string()),
  name_in_english: z.string().min(1),
  source_id: z.string().uuid(),
});

export type SpellCreateInput = z.infer<typeof SpellCreateSchema>;

export const SpellUpdateSchema = SpellCreateSchema.deepPartial();
export type SpellUpdateInput = z.infer<typeof SpellUpdateSchema>;
