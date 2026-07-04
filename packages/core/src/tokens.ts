/**
 * Design tokens shared across web and mobile.
 *
 * These are plain values (no platform styling primitives) so both the web
 * (Tailwind/CSS) and native (StyleSheet / react-native-svg) layers can consume
 * them. See `docs/design-tokens.md` for the full reference.
 */

export const colors = {
  /** Primary / background */
  black: '#0a0a0f',
  deepPurple: '#2d1b69',
  darkPurple: '#1a0a3d',
  /** Auxiliary / accent */
  white: '#f0f0ff',
  gold: '#f5c842',
  midnightBlue: '#1e3a8a',
  /** Glow / highlight */
  lavender: '#c9b6ff',
  electricBlue: '#5b8dff',
} as const;

export const fonts = {
  /** Headings & card names. */
  display: 'Cinzel',
  /** Secondary serif for longer text. */
  serif: 'Cormorant Garamond',
  /** Clean sans-serif for body / UI. */
  sans: 'Inter',
} as const;

/** Selection glow color (pale lavender). */
export const glow = colors.lavender;

/** Maximum cards allowed in a single spread. */
export const MAX_SELECTION = 10;

/** Minimum cards required before the Enter button appears. */
export const MIN_SELECTION = 1;
