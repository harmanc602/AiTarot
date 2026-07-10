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

export function wheelMetrics(w: number, h: number): WheelMetrics {
  // Radius and arc are width-driven (keeps the fan's *shape* stable): narrow
  // viewports show a slimmer arc, wide ones open up to the full spread.
  const radius = Math.max(260, Math.min(w * 0.62, 540));
  const visibleHalfArc = w === 0 ? 54 : Math.max(25, Math.min(54, w / 13.33));
  const arcRad = (visibleHalfArc * Math.PI) / 180;

  // Sagitta: how far the lowest visible cards drop below the apex.
  const sagitta = radius * (1 - Math.cos(arcRad));

  // Card size is the smaller of what the width allows and what makes the fan
  // fill the band's *height*. The height budget is the band minus the fan's
  // fixed vertical costs (top gap, sagitta, selected-lift, bottom margin),
  // solved for the card height (= cardWidth * CARD_ASPECT):
  //   h = topGap + liftedCard + sagitta + bottomMargin
  //     = cardH*(TOP_GAP + 1 + LIFT + BOTTOM) + sagitta
  const vFactor = CARD_ASPECT * (TOP_GAP_FACTOR + 1 + SELECT_LIFT_FACTOR + BOTTOM_MARGIN_FACTOR);
  const widthCap = Math.min(138, w * 0.42);
  const heightCap = h > 0 ? (h - sagitta) / vFactor : widthCap;
  const cardWidth = Math.max(64, Math.min(widthCap, heightCap));
  const cardHeight = cardWidth * CARD_ASPECT;

  const bottomMargin = cardHeight * BOTTOM_MARGIN_FACTOR;
  const topGap = cardHeight * TOP_GAP_FACTOR;

  // Anchor the fan to the bottom of the band; clamp so the apex (plus its lift
  // and top gap) can never clip off the top on short bands.
  const minHub = radius + cardHeight * (TOP_GAP_FACTOR + SELECT_LIFT_FACTOR);
  const bottomAnchoredHub = h - bottomMargin + radius * Math.cos(arcRad) - cardHeight / 2;
  const hubTop = h > 0 ? Math.max(minHub, bottomAnchoredHub) : radius + topGap;

  return { cardWidth, cardHeight, radius, visibleHalfArc, hubTop };
}
