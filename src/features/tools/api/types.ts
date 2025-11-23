export interface Weight {
  count: number;
  unit: string;
}

export interface Coin {
  count: number;
  piece_type: string;
}

export interface Tool {
  tool_id: string;
  tool_category: string;
  tool_type: string;
  name: string;
  description: string;
  weight: Weight | null;
  cost: Coin | null;
  material_id: string;
}
