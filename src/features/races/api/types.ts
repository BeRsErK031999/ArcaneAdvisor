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
