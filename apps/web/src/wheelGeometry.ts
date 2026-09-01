/**
 * Wheel sizing math for the picker's `CardWheel`.
 *
 * The wheel is laid out inside a band whose size is decided by the page's flex
 * layout (not by this module). Given that band's measured width and height, we
 * derive the card size, radius, visible arc, and the hub offset so the fan:
 *   - fills the band vertically on tall/mobile viewports (height-aware sizing),
 *   - keeps a clear gap above the apex so it never crowds the text above,
 *   - anchors to the bottom of the band and clips cleanly at the edges.
 */
export interface WheelMetrics {
  cardWidth: number;
  cardHeight: number;
  radius: number;
  visibleHalfArc: number;
  /** Vertical offset (px) of the hub below the top of the wheel band. */
  hubTop: number;
}

// Tunable factors.
const TOP_GAP_FACTOR = 0.35; // clearance above the apex card, in card-heights
const BOTTOM_MARGIN_FACTOR = 0.3; // clearance below the lowest cards
const SELECT_LIFT_FACTOR = 0.2; // how far a selected card slides outward
const CARD_ASPECT = 1.5; // wheel-back SVG ratio (height / width)
const EDGE_MARGIN = 8; // px kept clear at the band's left/right edges
const MIN_HALF_ARC = 14; // never show less than ~7 cards (step is 360/78)
const MAX_HALF_ARC = 54;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** How far the lowest visible cards drop below the apex. */
const sagittaFor = (radius: number, halfArc: number) =>
  radius * (1 - Math.cos(toRad(halfArc)));

/**
 * Largest half-arc (deg) at which the *outermost* card still fits inside the
 * band's width. A card at angle θ is centred at `radius·sinθ` from the hub and
 * tilted by θ, so it reaches `(cardW/2)·cosθ + (cardH/2)·sinθ` past its own
 * centre; a selected card also sits `lift` further out. Requiring
 *
 *   (radius + lift + cardH/2)·sinθ + (cardW/2)·cosθ  ≤  w/2 − margin
 *
 * is `A·sinθ + B·cosθ = C`, i.e. `hypot(A,B)·sin(θ + φ) = C` with
 * `φ = atan2(B, A)` — solvable in closed form. Without this the arc was chosen
 * from the band width alone, so on a narrow band (e.g. the landscape split at
 * 40%) the end cards were drawn past the edge and clipped mid-card.
 */
function fitHalfArc(w: number, radius: number, cardWidth: number, cardHeight: number): number {
  const a = radius + cardHeight * SELECT_LIFT_FACTOR + cardHeight / 2;
  const b = cardWidth / 2;
  const c = w / 2 - EDGE_MARGIN;
  const hyp = Math.hypot(a, b);
  if (c >= hyp) return MAX_HALF_ARC; // whole ring fits; width is not the limit
  const theta = Math.asin(Math.max(-1, Math.min(1, c / hyp))) - Math.atan2(b, a);
  return Math.max(0, (theta * 180) / Math.PI);
}

/**
 * Card size for a given vertical budget: the smaller of what the width allows
 * and what makes the fan fill the band's *height*. The height budget is the
 * band minus the fan's fixed vertical costs (top gap, sagitta, selected-lift,
 * bottom margin), solved for the card height (= cardWidth * CARD_ASPECT):
 *   h = topGap + liftedCard + sagitta + bottomMargin
 *     = cardH*(TOP_GAP + 1 + LIFT + BOTTOM) + sagitta
 */
function cardWidthFor(w: number, h: number, sagitta: number): number {
  const vFactor = CARD_ASPECT * (TOP_GAP_FACTOR + 1 + SELECT_LIFT_FACTOR + BOTTOM_MARGIN_FACTOR);
  const widthCap = Math.min(138, w * 0.42);
  const heightCap = h > 0 ? (h - sagitta) / vFactor : widthCap;
  return Math.max(64, Math.min(widthCap, heightCap));
}

export function wheelMetrics(w: number, h: number): WheelMetrics {
  // Radius stays width-driven, which keeps the fan's *shape* stable.
  const radius = Math.max(260, Math.min(w * 0.62, 540));

  // Card size and visible arc are coupled: a bigger card forces a shorter arc
  // to stay inside the width, and a shorter arc frees vertical room for a
  // bigger card. Two passes settle it — and because pass 2's arc is computed
  // from pass 2's (larger) card, the fit guarantee holds for what we return.
  const baseArc = w === 0 ? MAX_HALF_ARC : Math.max(25, Math.min(MAX_HALF_ARC, w / 13.33));
  const firstCard = cardWidthFor(w, h, sagittaFor(radius, baseArc));
  const firstArc = Math.min(baseArc, fitHalfArc(w, radius, firstCard, firstCard * CARD_ASPECT));

  const cardWidth = w === 0 ? firstCard : cardWidthFor(w, h, sagittaFor(radius, firstArc));
  const cardHeight = cardWidth * CARD_ASPECT;
  const visibleHalfArc =
    w === 0
      ? MAX_HALF_ARC
      : Math.max(
          MIN_HALF_ARC,
          Math.min(firstArc, fitHalfArc(w, radius, cardWidth, cardHeight)),
        );

  const arcRad = toRad(visibleHalfArc);
  const bottomMargin = cardHeight * BOTTOM_MARGIN_FACTOR;
  const topGap = cardHeight * TOP_GAP_FACTOR;

  // Anchor the fan to the bottom of the band; clamp so the apex (plus its lift
  // and top gap) can never clip off the top on short bands.
  const minHub = radius + cardHeight * (TOP_GAP_FACTOR + SELECT_LIFT_FACTOR);
  const bottomAnchoredHub = h - bottomMargin + radius * Math.cos(arcRad) - cardHeight / 2;
  const hubTop = h > 0 ? Math.max(minHub, bottomAnchoredHub) : radius + topGap;

  return { cardWidth, cardHeight, radius, visibleHalfArc, hubTop };
}
