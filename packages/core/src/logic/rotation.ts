/**
 * Card-wheel rotation math, shared by web and mobile.
 *
 * The deck is arranged as a **real wheel**: all cards are spaced evenly around a
 * full 360° circle. Only the *upper arc* is visible — the wheel's center sits
 * below the visible band, so cards fan across the top like the rim of a Ferris
 * wheel. Dragging left/right rotates the whole wheel; because the cards form a
 * closed ring, rotation loops forever with no "end".
 *
 * The recommended rendering model is: place every card at its fixed
 * `cardBaseAngle` around the hub once, then rotate the *container* by
 * `rotation`. Cards then slide along the arc together (never popping in from the
 * center), and any card past the horizon is simply clipped.
 *
 * Angles are in **degrees**. 0° points straight up (12 o'clock); positive angles
 * go clockwise.
 */

export interface WheelLayout {
  /** Number of cards on the wheel. */
  count: number;
  /** Angular gap between adjacent cards, in degrees (360 / count). */
  step: number;
  /**
   * Half-width of the visible arc, in degrees. Cards whose angle from top
   * exceeds this are below the horizon and can be hidden for performance.
   */
  visibleHalfArc: number;
}

/**
 * Build a seamless-ring layout for `count` cards. The angular `step` is derived
 * as `360 / count` so the cards close the circle exactly and rotation can loop
 * forever. `visibleHalfArc` controls how much of the upper arc is shown.
 */
export function makeWheelLayout(count: number, visibleHalfArc = 62): WheelLayout {
  return { count, step: 360 / count, visibleHalfArc };
}

/**
 * The card's *fixed* angle around the wheel (deg from top, clockwise), before
 * any rotation. Card 0 sits at the top; the rest fan clockwise around the ring.
 * Use this to place cards once inside a container you then rotate by `rotation`.
 */
export function cardBaseAngle(index: number, layout: WheelLayout): number {
  return index * layout.step;
}

/** Normalize an angle to the range (-180, 180]. */
export function normalizeAngle(angle: number): number {
  let a = angle % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return a;
}

/**
 * The angle (deg from top) at which card `index` currently sits given the wheel
 * `rotation`, normalized to (-180, 180]. Handy for visibility tests, z-ordering,
 * or "which card is at the top" queries.
 */
export function cardAngle(index: number, rotation: number, layout: WheelLayout): number {
  return normalizeAngle(cardBaseAngle(index, layout) + rotation);
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
export function dragToRotation(deltaX: number, sensitivity = 0.28): number {
  return deltaX * sensitivity;
}

/**
 * Wrap `rotation` into (-180, 180]. The wheel is a closed ring, so rotation
 * never hits an end — we only keep the number small to avoid unbounded growth.
 */
export function wrapRotation(rotation: number): number {
  return normalizeAngle(rotation);
}

/**
 * Position a card on screen given its angle and the wheel radius. Returns the
 * offset (px) from the wheel's center plus the tangential tilt (deg) so cards
 * point outward like spokes. Used when placing each card around the hub.
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
