# Design Token Reference

The aesthetic is **magical, mystical, elegant — but restrained**: deep space, arcane
symbolism, quiet mystery, minimal visual noise.

All tokens are defined once in [`packages/core/src/tokens.ts`](../packages/core/src/tokens.ts)
as plain values so both platforms consume them:

- **Web** — imported into `apps/web/tailwind.config.js` (exposed as Tailwind color/font
  utilities) and used directly in the SVG card back.
- **Mobile** — imported into React Native `StyleSheet` objects and `react-native-svg`.

## Colors

| Token | Hex | Role |
|---|---|---|
| `black` | `#0a0a0f` | Primary background |
| `deepPurple` | `#2d1b69` | Background gradient (top) |
| `darkPurple` | `#1a0a3d` | Background gradient (bottom) |
| `white` | `#f0f0ff` | Primary text / accents |
| `gold` | `#f5c842` | Accent — brand, borders, Enter button, card-back rays |
| `midnightBlue` | `#1e3a8a` | Secondary accent |
| `lavender` | `#c9b6ff` | Glow / selection highlight |
| `electricBlue` | `#5b8dff` | Glow / highlight |

The app background is a radial gradient from `deepPurple` → `darkPurple` → `black`, with a
faint starfield overlay (`.starfield` on web).

### Tailwind names (web)

The camelCase tokens are exposed as kebab-case Tailwind utilities:
`bg-deep-purple`, `text-gold`, `border-midnight-blue`, `ring-lavender`,
`text-electric-blue`, plus a `shadow-glow` utility (lavender + electric-blue bloom).

## Typography

| Token | Family | Use |
|---|---|---|
| `fonts.display` | **Cinzel** | Headings, brand, card names, Enter button |
| `fonts.serif` | **Cormorant Garamond** | Instructional text, secondary serif |
| `fonts.sans` | **Inter** | Body / UI controls |

- **Web** loads the fonts from Google Fonts in `apps/web/index.html`.
- **Mobile** loads them via `@expo-google-fonts/*` in `apps/mobile/app/_layout.tsx`.

## Selection & limits

| Token | Value | Meaning |
|---|---|---|
| `MIN_SELECTION` | `1` | Minimum cards before the Enter button appears |
| `MAX_SELECTION` | `10` | Maximum spread size; an 11th tap triggers the toast |
| `glow` | `colors.lavender` | Selection glow color |

## Glow / highlight

Selected cards get a lavender ring + bloom:

- **Web:** `shadow-glow` + `ring-2 ring-lavender` and a slight lift/scale via Framer Motion.
- **Mobile:** `shadowColor` lavender with radius + `elevation`, plus a Reanimated lift/scale.

## Animation guidelines

Keep motion **subtle and physical**:

- **Wheel rotation** — spring-based, follows the drag 1:1 via `dragToRotation` (deg/px);
  clamped at both ends of the deck by `clampRotation`.
- **Enter button** — fades + scales in (~300 ms) when the first card is selected.
- **Card reveal** — a `rotateY` flip (~500 ms) with a per-card stagger (~120 ms).
- **Toast** — fades/slides up from the bottom; auto-dismisses after ~2.6 s.

## The card back

A single motif shared by both platforms (`CardBack.tsx` in each app): a **celestial
mandala** — deep-purple gradient body, gold border, a radiant gold sun/star burst, an orbit
of moon-phase dots, concentric lavender/electric-blue rings, and a scattered starfield.
Drawn as SVG (web `<svg>`, mobile `react-native-svg`) so it scales crisply and pulls every
color from the tokens above. Card ratio is **2:3** (width × 1.5).
