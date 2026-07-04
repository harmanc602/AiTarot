/** Supported UI / card-name languages. */
export type Language = 'en' | 'zh' | 'ja';

export const LANGUAGES: Language[] = ['en', 'zh', 'ja'];

/** Minor-arcana suits. Values double as the image-key prefix (e.g. `cups01.jpg`). */
export type Suit = 'cups' | 'pents' | 'swords' | 'wands';

export type Arcana = 'major' | 'minor';

/** A localized set of strings keyed by {@link Language}. */
export type Localized = Record<Language, string>;

/** One tarot card as stored in `data/tarot-cards.json`. */
export interface TarotCard {
  /** Stable unique id, e.g. `major-00`, `cups-01`. */
  id: string;
  arcana: Arcana;
  /** `null` for Major Arcana. */
  suit: Suit | null;
  /** RWS number: majors 0–21; minors 1–14 (11=Page…14=King). */
  number: number;
  /** Key into the per-platform image map; matches files under `assets/img/clean`. */
  imageKey: string;
  /** Localized display name (without upright/reversed suffix). */
  name: Localized;
}

/** Orientation chosen at reveal time. */
export type Orientation = 'upright' | 'reversed';

/** A card the user selected, paired with its revealed orientation. */
export interface RevealedCard {
  card: TarotCard;
  orientation: Orientation;
}
