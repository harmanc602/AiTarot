import type { Orientation, RevealedCard, TarotCard } from '../types';

/**
 * Randomly determine a card's orientation with a 50/50 probability.
 * `rng` is injectable for deterministic tests.
 */
export function randomOrientation(rng: () => number = Math.random): Orientation {
  return rng() < 0.5 ? 'upright' : 'reversed';
}

/**
 * Reveal the selected cards: each is assigned an independent, random
 * upright/reversed orientation at the moment of reveal (per the spec).
 *
 * `cards` should already be resolved from the selected ids in the order the
 * user picked them; orientation is decided here, once, so re-renders don't
 * flip cards.
 */
export function revealCards(
  cards: readonly TarotCard[],
  rng: () => number = Math.random,
): RevealedCard[] {
  return cards.map((card) => ({ card, orientation: randomOrientation(rng) }));
}
