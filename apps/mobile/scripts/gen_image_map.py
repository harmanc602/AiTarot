#!/usr/bin/env python3
"""Generate the mobile app's static card-image require() map.

React Native / Metro require *static* require() paths (no dynamic string
interpolation), so every one of the 78 card images must be enumerated. This
script reads the canonical card list and emits `apps/mobile/src/cardImages.ts`,
keeping it in sync with `packages/core/data/tarot-cards.json`.

Run from the repo root:
    python apps/mobile/scripts/gen_image_map.py
"""
from __future__ import annotations

import json
import os

HERE = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
DATA = os.path.join(REPO_ROOT, "packages", "core", "data", "tarot-cards.json")
OUT = os.path.join(REPO_ROOT, "apps", "mobile", "src", "cardImages.ts")

HEADER = """/**
 * Static image map for the mobile app.
 *
 * React Native / Metro require STATIC require() paths (no dynamic strings), so
 * every card image is enumerated here. Generated to match
 * packages/core/data/tarot-cards.json — regenerate via
 * `python apps/mobile/scripts/gen_image_map.py` if cards or files change.
 */
import type { ImageSourcePropType } from 'react-native';

// Card artwork lives at the repo root (assets/img/clean), shared with web.
const images: Record<string, ImageSourcePropType> = {
"""

FOOTER = """};

/** Resolve a card image source by its imageKey. */
export function cardImage(imageKey: string): ImageSourcePropType {
  return images[imageKey];
}

export default images;
"""


def main() -> None:
    with open(DATA, encoding="utf-8") as f:
        cards = json.load(f)
    keys = [c["imageKey"] for c in cards]

    lines = [HEADER]
    for k in keys:
        lines.append(f"  {k}: require('../../../assets/img/clean/{k}.jpg'),\n")
    lines.append(FOOTER)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("".join(lines))

    print(f"Wrote {len(keys)} entries -> {OUT}")


if __name__ == "__main__":
    main()
