import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DECK,
  cardAngle,
  cardBaseAngle,
  cardTransform,
  dragToRotation,
  isCardVisible,
  makeWheelLayout,
  shuffle,
  wrapRotation,
} from '@aitarot/core';
import CardBack from './CardBack';
import { wheelMetrics } from '../wheelGeometry';

interface CardWheelProps {
  /** Selected card ids (for the glow indicator). */
  selected: string[];
  /** Called when a card is tapped/clicked. */
  onSelect: (cardId: string) => void;
}

/**
 * The interactive card wheel — a *real* wheel. All 78 backs are placed once at
 * fixed positions around a full 360° ring, and the whole ring container is
 * rotated by `rotation`. So the cards slide along the arc together (they never
 * pop in from the center), and because the ring is closed the wheel spins
 * forever with no end stop.
 *
 * Only the upper arc is visible: the hub (wheel center) sits below the visible
 * band and everything outside the band is clipped. Rotation math is shared with
 * the native app via `@aitarot/core`.
 */
export default function CardWheel({ selected, onSelect }: CardWheelProps) {
  const [rotation, setRotation] = useState(0);

  // Shuffle the deck once per mount so the wheel isn't in canonical order every
  // time (memoized so a re-render never reshuffles mid-spin, which would make
  // the backs jump around under the pointer).
  const deck = useMemo(() => shuffle(DECK), []);

  // Responsive sizing: measure the viewport band and derive radius + card size.
  const viewportRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // All sizing/placement math is shared with the picker layout (App.tsx) via
  // `wheelMetrics`, so the instruction block can be positioned right above the
  // fan without guessing where the fan's apex lands.
  const { cardWidth, cardHeight, radius, visibleHalfArc, hubTop } = wheelMetrics(
    size.w,
    size.h,
  );
  const layout = useMemo(
    () => makeWheelLayout(DECK.length, visibleHalfArc),
    [visibleHalfArc],
  );

  const dragStart = useRef<{ x: number; rot: number } | null>(null);
  const moved = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragStart.current = { x: e.clientX, rot: rotation };
      moved.current = 0;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    },
    [rotation],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const deltaX = e.clientX - dragStart.current.x;
    moved.current = Math.max(moved.current, Math.abs(deltaX));
    // Wheel follows the finger: drag right → the ring spins right (clockwise),
    // so the cards under the pointer travel the same way the hand moves.
    setRotation(wrapRotation(dragStart.current.rot + dragToRotation(deltaX)));
  }, []);

  const endDrag = useCallback(() => {
    dragStart.current = null;
  }, []);

  const handleCardClick = useCallback(
    (cardId: string) => {
      // Ignore taps that were really drags.
      if (moved.current > 6) return;
      onSelect(cardId);
    },
    [onSelect],
  );

  return (
    <div
      ref={viewportRef}
      className="no-select relative h-full w-full overflow-hidden"
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="listbox"
      aria-label="Tarot card wheel"
    >
      {/* The whole ring rotates as one unit; cards are placed once around it. */}
      <div
        className="absolute left-1/2"
        style={{
          top: hubTop,
          width: 0,
          height: 0,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {deck.map((card, index) => {
          // Hide cards below the horizon (still mounted as they cross the edge).
          if (!isCardVisible(cardAngle(index, rotation, layout), layout)) return null;
          const base = cardBaseAngle(index, layout);
          const { x, y, rotate } = cardTransform(base, radius);
          const isSelected = selected.includes(card.id);
          // Stack by *current on-screen angle*, not DOM/index order: each card
          // overlaps the one to its left. z grows left→right (with the angle,
          // since +x/+angle is the right side), and deriving it from the live
          // angle instead of the fixed index keeps the overlap consistent across
          // the ring's 77→0 seam — so no card ends up covered from both sides.
          const onScreenAngle = cardAngle(index, rotation, layout);
          const zIndex = Math.round(1000 + onScreenAngle);
          return (
            <button
              key={card.id}
              type="button"
              aria-label={`Card ${index + 1}`}
              aria-selected={isSelected}
              onClick={() => handleCardClick(card.id)}
              className="absolute cursor-pointer border-0 bg-transparent p-0"
              style={{
                width: cardWidth,
                height: cardHeight,
                left: -cardWidth / 2,
                top: -cardHeight / 2,
                // Place around the ring, tilt outward, then slide selected
                // cards outward along their own radial axis (last transform =
                // local frame, so -Y pushes the card away from the hub).
                transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) translateY(${
                  isSelected ? -cardHeight * 0.2 : 0
                }px)`,
                transformOrigin: 'center center',
                transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                zIndex,
              }}
            >
              <div
                className={`h-full w-full overflow-hidden rounded-lg ${
                  isSelected
                    ? 'shadow-glow ring-2 ring-lavender'
                    : 'shadow-lg shadow-black/60'
                }`}
              >
                <CardBack width={cardWidth} className="block h-full w-full" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
