/**
 * Card-wheel rotation math, shared by web and mobile.
 *
 * The deck is arranged around a large circle. Only the *upper arc* is visible:
 * the wheel's center sits far below the screen, so cards fan across the top like
 * a hand of cards. Dragging left/right rotates the wheel, cycling through all 78
 * cards.
 *
 * Angles are in **degrees**. 0° points straight up (12 o'clock); positive angles
 * go clockwise. `rotation` is the wheel's current offset — increasing it as the
 * user drags right brings earlier cards toward the top.
 */

export interface WheelLayout {
  /** Number of cards on the wheel. */
  count: number;
  /** Angular gap between adjacent cards, in degrees. */
  step: number;
  /**
   * Half-width of the visible arc, in degrees. Cards whose angle from top
   * exceeds this are considered off-screen (below the horizon) and may be
   * skipped for performance.
   */
  visibleHalfArc: number;
}

/**
 * Build a layout for `count` cards spaced `step` degrees apart. `visibleHalfArc`
 * defaults to 90° (the full upper half). Tighten it to render fewer cards.
 */
export function makeWheelLayout(count: number, step = 7, visibleHalfArc = 90): WheelLayout {
  return { count, step, visibleHalfArc };
}

/**
 * The angle (deg from top, clockwise) at which card `index` currently sits,
 * given the wheel `rotation`. Cards are centered so index 0 starts at the top
 * when rotation is 0.
 */
export function cardAngle(index: number, rotation: number, layout: WheelLayout): number {
  const centered = index - (layout.count - 1) / 2;
  return centered * layout.step - rotation;
}

/** Normalize an angle to the range (-180, 180]. */
export function normalizeAngle(angle: number): number {
  let a = angle % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return a;
}

/** Whether a card at `angle` (deg from top) falls within the visible upper arc. */
export function isCardVisible(angle: number, layout: WheelLayout): boolean {
  return Math.abs(normalizeAngle(angle)) <= layout.visibleHalfArc;
}

/**
 * Convert a horizontal drag distance (px) into a rotation delta (deg).
 * `sensitivity` is degrees per pixel; the default gives a natural, physical
 * feel on both touch and mouse.
 */
export function dragToRotation(deltaX: number, sensitivity = 0.25): number {
  return deltaX * sensitivity;
}

/**
 * Clamp `rotation` so the user cannot spin past either end of the (non-looping)
 * deck. The extremes place the first / last card at the top.
 */
export function clampRotation(rotation: number, layout: WheelLayout): number {
  const half = ((layout.count - 1) / 2) * layout.step;
  return Math.max(-half, Math.min(half, rotation));
}

/**
 * Position a card on screen given its angle and the wheel radius. Returns the
 * offset (px) from the wheel's center plus the tangential tilt (deg) so the card
 * points outward like spokes. The caller places the wheel center below the
 * viewport; only cards with small |angle| are visible.
 */
export function cardTransform(
  angleDeg: number,
  radius: number,
): { x: number; y: number; rotate: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: radius * Math.sin(rad),
    // Negative because screen-y grows downward; cards near the top have small y.
    y: -radius * Math.cos(rad),
    rotate: angleDeg,
  };
}
