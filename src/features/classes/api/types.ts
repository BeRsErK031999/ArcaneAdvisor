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
