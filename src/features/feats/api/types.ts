export interface FeatRequiredModifier {
  modifier: string;
  min_value: number;
}

export interface Feat {
  feat_id: string;
  name: string;
  description: string;
  caster: boolean;
  required_armor_types: string[];
  required_modifiers: FeatRequiredModifier[];
  increase_modifiers: string[];
}
