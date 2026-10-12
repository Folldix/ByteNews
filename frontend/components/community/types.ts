export type ReactionKind = "useful" | "fire" | "insight" | "controversial";
 
/** Скільки разів кожну реакцію обрали. Наприклад: { useful: 3, fire: 0, ... } */
export type ReactionCounts = Record<ReactionKind, number>;
 
/** Початковий стан: у всіх реакцій спочатку 0. */
export const EMPTY_REACTION_COUNTS: ReactionCounts = {
  useful: 0,
  fire: 0,
  insight: 0,
  controversial: 0,
};