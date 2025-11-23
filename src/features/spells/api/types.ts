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
