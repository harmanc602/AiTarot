#!/usr/bin/env python3
"""Generate the canonical 78-card tarot dataset in English, Traditional Chinese, and Japanese.

The output (``packages/core/data/tarot-cards.json``) is the single source of truth for
card identity and localized names consumed by both the web and mobile apps.

Image key convention (matches files under ``assets/img/clean``):
  - Major Arcana:  ``maj00`` .. ``maj21``
  - Minor Arcana:  ``{suit}{NN}`` where suit is one of cups/pents/swords/wands and
                   NN is 01..14  (01=Ace .. 10=Ten, 11=Page, 12=Knight, 13=Queen, 14=King)

Run from the repo root:
    python packages/core/scripts/gen_cards.py
"""
from __future__ import annotations

import json
import os

# --- Major Arcana ------------------------------------------------------------
# (number, en, zh, ja) — zh is Traditional Chinese; number is the RWS 0..21 ordering.
MAJORS = [
    (0, "The Fool", "愚者", "愚者"),
    (1, "The Magician", "魔術師", "魔術師"),
    (2, "The High Priestess", "女祭司", "女教皇"),
    (3, "The Empress", "皇后", "女帝"),
    (4, "The Emperor", "皇帝", "皇帝"),
    (5, "The Hierophant", "教皇", "教皇"),
    (6, "The Lovers", "戀人", "恋人"),
    (7, "The Chariot", "戰車", "戦車"),
    (8, "Strength", "力量", "力"),
    (9, "The Hermit", "隱士", "隠者"),
    (10, "Wheel of Fortune", "命運之輪", "運命の輪"),
    (11, "Justice", "正義", "正義"),
    (12, "The Hanged Man", "倒吊人", "吊された男"),
    (13, "Death", "死神", "死神"),
    (14, "Temperance", "節制", "節制"),
    (15, "The Devil", "惡魔", "悪魔"),
    (16, "The Tower", "高塔", "塔"),
    (17, "The Star", "星星", "星"),
    (18, "The Moon", "月亮", "月"),
    (19, "The Sun", "太陽", "太陽"),
    (20, "Judgement", "審判", "審判"),
    (21, "The World", "世界", "世界"),
]

# --- Minor Arcana suits ------------------------------------------------------
# imageKey prefix, en suit noun, zh (Traditional) suit char, ja suit word
SUITS = [
    ("cups", "Cups", "杯", "カップ"),
    ("pents", "Pentacles", "星幣", "ペンタクル"),
    ("swords", "Swords", "劍", "ソード"),
    ("wands", "Wands", "權杖", "ワンド"),
]

# Ranks 1..14 keyed by their card number.
# EN uses "Ace/Two.../Page/Knight/Queen/King".
# ZH (Traditional) pip cards use 一..十; courts use 侍從/騎士/王后/國王, formatted as "{suit}{rank}" e.g. 杯一.
# JA uses エース/2..10 then ペイジ/ナイト/クイーン/キング, formatted as "{suit}の{rank}".
EN_RANKS = {
    1: "Ace", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven",
    8: "Eight", 9: "Nine", 10: "Ten", 11: "Page", 12: "Knight", 13: "Queen", 14: "King",
}
ZH_RANKS = {
    1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七",
    8: "八", 9: "九", 10: "十", 11: "侍從", 12: "騎士", 13: "王后", 14: "國王",
}
JA_RANKS = {
    1: "エース", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
    8: "8", 9: "9", 10: "10", 11: "ペイジ", 12: "ナイト", 13: "クイーン", 14: "キング",
}


def build_cards() -> list[dict]:
    cards: list[dict] = []

    for number, en, zh, ja in MAJORS:
        cards.append(
            {
                "id": f"major-{number:02d}",
                "arcana": "major",
                "suit": None,
                "number": number,
                "imageKey": f"maj{number:02d}",
                "name": {"en": en, "zh": zh, "ja": ja},
            }
        )

    for prefix, en_suit, zh_suit, ja_suit in SUITS:
        for number in range(1, 15):
            cards.append(
                {
                    "id": f"{prefix}-{number:02d}",
                    "arcana": "minor",
                    "suit": prefix,
                    "number": number,
                    "imageKey": f"{prefix}{number:02d}",
                    "name": {
                        "en": f"{EN_RANKS[number]} of {en_suit}",
                        "zh": f"{zh_suit}{ZH_RANKS[number]}",
                        "ja": f"{ja_suit}の{JA_RANKS[number]}",
                    },
                }
            )

    return cards


def main() -> None:
    cards = build_cards()
    assert len(cards) == 78, f"expected 78 cards, got {len(cards)}"

    # Guard against duplicate ids / image keys.
    ids = {c["id"] for c in cards}
    keys = {c["imageKey"] for c in cards}
    assert len(ids) == 78 and len(keys) == 78, "duplicate id or imageKey detected"

    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "tarot-cards.json")
    out_path = os.path.abspath(out_path)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Wrote {len(cards)} cards -> {out_path}")


if __name__ == "__main__":
    main()
