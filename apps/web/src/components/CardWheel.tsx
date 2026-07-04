import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DECK,
  cardAngle,
  cardTransform,
  clampRotation,
  dragToRotation,
  isCardVisible,
  makeWheelLayout,
} from '@aitarot/core';
import CardBack from './CardBack';

interface CardWheelProps {
  /** Selected card ids (for the glow indicator). */
  selected: string[];
  /** Called when a card is tapped/clicked. */
  onSelect: (cardId: string) => void;
}

const CARD_WIDTH = 96; // px
const RADIUS = 520; // wheel radius; center sits far below the viewport
const STEP_DEG = 6.2; // angular gap between cards

/**
 * The interactive card wheel. All 78 backs are arranged around a large circle
 * whose center is pushed below the screen, so only the upper arc is visible.
 * Drag (mouse or touch) rotates the wheel; tapping a card selects it.
 *
 * Rotation math lives in `@aitarot/core` (`rotation.ts`) and is shared with the
 * native app; here we only bind it to pointer events + Framer Motion springs.
 */
export default function CardWheel({ selected, onSelect }: CardWheelProps) {
  const layout = useMemo(() => makeWheelLayout(DECK.length, STEP_DEG, 70), []);
  const [rotation, setRotation] = useState(0);
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

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current) return;
      const deltaX = e.clientX - dragStart.current.x;
      moved.current = Math.max(moved.current, Math.abs(deltaX));
      setRotation(clampRotation(dragStart.current.rot + dragToRotation(deltaX), layout));
    },
    [layout],
  );

  const endDrag = useCallback(() => {
    dragStart.current = null;
  }, []);

  const handleCardClick = useCallback(
    (cardId: string) => {
      // Ignore taps that were actually drags.
      if (moved.current > 6) return;
      onSelect(cardId);
    },
    [onSelect],
  );

  return (
    <div
      className="no-select relative w-full overflow-hidden"
      style={{ height: RADIUS * 0.42 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="listbox"
      aria-label="Tarot card wheel"
    >
      {/* Wheel center is below the visible area; cards fan across the top arc. */}
      <div className="absolute left-1/2 top-full" style={{ transform: 'translateX(-50%)' }}>
        {DECK.map((card, index) => {
          const angle = cardAngle(index, rotation, layout);
          if (!isCardVisible(angle, layout)) return null;
          const { x, y, rotate } = cardTransform(angle, RADIUS);
          const isSelected = selected.includes(card.id);
          return (
            <motion.button
              key={card.id}
              type="button"
              aria-label={`Card ${index + 1}`}
              aria-selected={isSelected}
              onClick={() => handleCardClick(card.id)}
              className="absolute rounded-lg"
              style={{
                width: CARD_WIDTH,
                left: -CARD_WIDTH / 2,
                top: -CARD_WIDTH * 0.75,
                x,
                rotate,
                transformOrigin: 'center center',
                zIndex: isSelected ? 40 : 100 - Math.round(Math.abs(angle)),
              }}
              animate={{ y: isSelected ? y - 24 : y, scale: isSelected ? 1.06 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              whileHover={{ scale: isSelected ? 1.08 : 1.04 }}
            >
              <div
                className={`overflow-hidden rounded-lg transition-shadow ${
                  isSelected ? 'shadow-glow ring-2 ring-lavender' : 'shadow-lg shadow-black/60'
                }`}
              >
                <CardBack width={CARD_WIDTH} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
