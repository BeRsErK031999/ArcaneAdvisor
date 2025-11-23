export interface Weight {
  count: number;
  unit: string;
}

export interface Coin {
  count: number;
  piece_type: string;
}

export interface Damage {
  dice_count: number;
  dice_type: string;
  damage_type: string;
}

export interface WeaponRange {
  normal: number | null;
  long: number | null;
  range_unit: string | null;
}

export interface Weapon {
  weapon_id: string;
  weapon_kind_id: string;
  weapon_type: string;
  name: string;
  description: string;
  damage: Damage;
  weapon_range: WeaponRange | null;
  properties: string[];
  weight: Weight | null;
  cost: Coin | null;
  material_id: string;
}
