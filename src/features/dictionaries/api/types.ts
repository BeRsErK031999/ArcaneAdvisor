export type DictionaryMap = Record<string, string>;

export interface DamageTypesResponse extends DictionaryMap {
  acid: string;
  bludgeoning: string;
  cold: string;
  fire: string;
  force: string;
  lightning: string;
  necrotic: string;
  piercing: string;
  poison: string;
  psychic: string;
  radiant: string;
  slashing: string;
  thunder: string;
}

export type PieceTypes = DictionaryMap;
export type DiceTypes = DictionaryMap;
export type GameTimeUnits = DictionaryMap;
export type LengthUnits = DictionaryMap;
export type WeightUnits = DictionaryMap;
export type Modifiers = DictionaryMap;
export type Skills = DictionaryMap;
export type CreatureTypes = DictionaryMap;
export type CreatureSizes = DictionaryMap;
