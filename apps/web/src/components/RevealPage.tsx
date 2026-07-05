import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { revealedCardLabel, type Language, type RevealedCard } from '@aitarot/core';
import { cardImage } from '../cardImages';

interface RevealPageProps {
  cards: RevealedCard[];
  onBack: () => void;
}

const CARD_ASPECT = 1.5; // height / width
const GAP = 20; // px gap between cards (matches gap-5)
const LABEL_H = 28; // px reserved under each card for its name

/**
 * Pick the grid shape (columns × rows) and the resulting card width that lets
 * the whole spread fit inside `avail` (w×h) without scrolling. We try every
 * column count and keep the one that yields the largest card, constrained by
 * BOTH the available width and height — so a small spread on a short-but-wide
 * window doesn't blow the cards up past what fits vertically.
 */
function fitGrid(count: number, avail: { w: number; h: number }) {
  if (count === 0 || avail.w === 0 || avail.h === 0) {
    return { cols: 1, cardWidth: 0 };
  }
  let best = { cols: 1, cardWidth: 0 };
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    // Width limit: cols cards + gaps must fit the available width.
    const wByWidth = (avail.w - (cols - 1) * GAP) / cols;
    // Height limit: rows of (card + label + gap) must fit the available height.
    const rowH = (avail.h - (rows - 1) * GAP) / rows;
    const wByHeight = (rowH - LABEL_H) / CARD_ASPECT;
    const cardWidth = Math.min(wByWidth, wByHeight);
    if (cardWidth > best.cardWidth) best = { cols, cardWidth };
  }
  // Keep cards readable but never larger than a sensible max.
  best.cardWidth = Math.min(best.cardWidth, 260);
  return best;
}

/**
 * Card Reveal page: each selected card shown face-up, upright or reversed
 * (decided once at reveal). The whole spread is sized to fit the viewport in
 * both dimensions — width AND height — so the user always sees every card
 * without scrolling, whether they picked 1 card or 10.
 */
export default function RevealPage({ cards, onBack }: RevealPageProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;

  // Measure the area available to the grid (between the title and the button).
  const gridAreaRef = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = gridAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setAvail({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { cols, cardWidth } = useMemo(
    () => fitGrid(cards.length, avail),
    [cards.length, avail],
  );

  return (
    <div className="starfield relative z-10 flex h-full flex-col overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col items-center px-4 py-6 sm:px-6">
        <h1 className="mb-4 shrink-0 text-center font-display text-3xl font-bold text-gold sm:text-4xl">
          {t('reveal.title')}
        </h1>

        {/* Flexible middle region the grid is measured against and centered in. */}
        <div ref={gridAreaRef} className="flex min-h-0 w-full flex-1 items-center justify-center">
          <div
            className="grid justify-center"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${cardWidth}px)`,
              gap: `${GAP}px`,
            }}
          >
            {cards.map((revealed, i) => {
              const { card, orientation } = revealed;
              return (
                <motion.div
                  key={card.id}
                  className="flex flex-col items-center"
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.12, type: 'spring', stiffness: 120 }}
                  style={{ perspective: 800, width: cardWidth }}
                >
                  <div
                    className="w-full overflow-hidden rounded-lg border border-gold/40 shadow-glow"
                    style={{ transform: orientation === 'reversed' ? 'rotate(180deg)' : undefined }}
                  >
                    <img
                      src={cardImage(card.imageKey)}
                      alt={revealedCardLabel(revealed, lang, t)}
                      className="block h-auto w-full"
                      draggable={false}
                    />
                  </div>
                  <p
                    className="mt-1 truncate text-center font-serif text-white"
                    style={{ height: LABEL_H, fontSize: Math.max(11, Math.min(16, cardWidth / 9)) }}
                  >
                    {revealedCardLabel(revealed, lang, t)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 shrink-0 rounded-full border border-lavender/60 px-6 py-2 font-sans text-white/90 transition-colors hover:bg-white/10"
        >
          {t('reveal.back')}
        </button>
      </div>
    </div>
  );
}
