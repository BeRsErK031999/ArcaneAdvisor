export interface Weight {
  count: number;
  unit: string;
}

export interface Coin {
  count: number;
  piece_type: string;
}

export interface Material {
  material_id: string;
  name: string;
  description: string;
  rarity: string;
  weight: Weight | null;
  cost: Coin | null;
  source_id: string;
}
