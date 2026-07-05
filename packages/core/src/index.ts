/**
 * @aitarot/core — framework-agnostic shared code for the web and mobile apps.
 *
 * Exposes: card data & deck helpers, i18n resources & label formatters, pure
 * selection / reveal / rotation logic, design tokens, and shared types.
 */

export * from './types';
export * from './tokens';

export { DECK, DECK_SIZE, getCardById, shuffle } from './logic/deck';
export {
  toggleSelection,
  canConfirm,
  isAtMax,
  MAX_SELECTION as MAX_CARDS,
  MIN_SELECTION as MIN_CARDS,
  type SelectionResult,
} from './logic/selection';
export { randomOrientation, revealCards } from './logic/reveal';
export {
  makeWheelLayout,
  cardBaseAngle,
  cardAngle,
  normalizeAngle,
  isCardVisible,
  dragToRotation,
  wrapRotation,
  cardTransform,
  type WheelLayout,
} from './logic/rotation';

export {
  resources,
  defaultLanguage,
  cardName,
  revealLabel,
  revealedCardLabel,
} from './i18n';
