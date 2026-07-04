/**
 * Minimal in-memory hand-off between the picker (index) and reveal routes.
 *
 * We avoid serializing the reading through router params: the picker writes the
 * selected card ids here, the reveal screen reads them once and decides
 * orientations there (so navigation/re-renders don't reflip cards).
 */
let selectedIds: string[] = [];

/** Called by the picker on Enter. */
export function commitSelection(ids: string[]): void {
  selectedIds = ids.slice();
}

/** Read the selected ids on the reveal screen. */
export function readSelection(): string[] {
  return selectedIds;
}

export function clearSelection(): void {
  selectedIds = [];
}
