export interface ArmorClass {
  base_class: number;
  modifier: string | null;
  max_modifier_bonus: number | null;
}

export interface Weight {
  count: number;
  unit: string;
}

export interface Coin {
  count: number;
  piece_type: string;
}

export interface Armor {
  armor_id: string;
  armor_type: string;
  name: string;
  description: string;
  armor_class: ArmorClass;
  strength: number;
  stealth: boolean;
  weight: Weight;
  cost: Coin;
  material_id: string;
}
