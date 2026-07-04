import { MAX_SELECTION, MIN_SELECTION } from '../tokens';

/** Result of attempting to toggle a card's selection. */
export interface SelectionResult {
  /** The next selection state (a new array; input is not mutated). */
  selection: string[];
  /** True when the toggle was rejected because the max was already reached. */
  rejected: boolean;
}

/**
 * Toggle a card id in the current selection.
 *
 * - If the card is already selected, it is removed (always allowed).
 * - If not selected and the selection is below {@link MAX_SELECTION}, it is added.
 * - If not selected and the selection is already at the max, the toggle is
 *   rejected (`rejected: true`) and the selection is returned unchanged — the UI
 *   should surface the "up to 10 cards" toast in this case.
 */
export function toggleSelection(selection: readonly string[], cardId: string): SelectionResult {
  if (selection.includes(cardId)) {
    return { selection: selection.filter((id) => id !== cardId), rejected: false };
  }
  if (selection.length >= MAX_SELECTION) {
    return { selection: selection.slice(), rejected: true };
  }
  return { selection: [...selection, cardId], rejected: false };
}

/** Whether the Enter/Confirm action should be available. */
export function canConfirm(selection: readonly string[]): boolean {
  return selection.length >= MIN_SELECTION;
}

/** Whether adding another card would be rejected. */
export function isAtMax(selection: readonly string[]): boolean {
  return selection.length >= MAX_SELECTION;
}

export { MAX_SELECTION, MIN_SELECTION };
