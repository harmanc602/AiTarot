import cardsJson from '../../data/tarot-cards.json';
import type { TarotCard } from '../types';

/** The full, immutable 78-card deck in canonical order (majors, then suits). */
export const DECK: readonly TarotCard[] = cardsJson as TarotCard[];

/** Total number of cards in a tarot deck. */
export const DECK_SIZE = DECK.length; // 78

/** Look up a card by its stable id. */
export function getCardById(id: string): TarotCard | undefined {
  return DECK.find((c) => c.id === id);
}

/**
 * Fisher–Yates shuffle returning a new array (does not mutate {@link DECK}).
 * `rng` defaults to `Math.random` but is injectable for deterministic tests.
 */
export function shuffle(
  cards: readonly TarotCard[] = DECK,
  rng: () => number = Math.random,
): TarotCard[] {
  const out = cards.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
