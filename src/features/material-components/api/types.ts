export interface Coin {
  count: number;
  piece_type: string;
}

export interface MaterialComponent {
  material_component_id: string;
  name: string;
  description: string;
  material_id: string | null;
  cost: Coin | null;
  consumed: boolean;
}
