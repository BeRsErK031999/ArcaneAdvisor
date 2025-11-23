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
