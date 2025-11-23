export interface ClassLevel {
  class_level_id: string;
  class_id: string;
  level: number;
  dice: unknown | null;
  spell_slots: number[] | null;
  number_cantrips_know: number | null;
  number_spells_know: number | null;
  number_arcanums_know: number | null;
  points: unknown | null;
  bonus_damage: unknown | null;
  increase_speed: unknown | null;
}
