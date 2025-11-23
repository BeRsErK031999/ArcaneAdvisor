export interface Spell {
  spell_id: string;
  name: string;
  description: string;
  level: number;
  school: string;
  // TODO: add more detailed typings when backend schema is finalized
  // duration?: unknown;
  // components?: unknown;
  // damage_type?: unknown;
}
