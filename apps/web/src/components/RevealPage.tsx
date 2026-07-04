import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { revealedCardLabel, type Language, type RevealedCard } from '@aitarot/core';
import { cardImage } from '../cardImages';

interface RevealPageProps {
  cards: RevealedCard[];
  onBack: () => void;
}

/**
 * Card Reveal page: each selected card shown face-up, upright or reversed
 * (decided once at reveal), in a responsive grid. Each card flips in and is
 * labeled below in the active language.
 */
export default function RevealPage({ cards, onBack }: RevealPageProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;

  return (
    <div className="starfield relative z-10 flex min-h-full flex-col items-center px-4 py-8">
      <h1 className="mb-8 font-display text-3xl font-bold text-gold sm:text-4xl">
        {t('reveal.title')}
      </h1>

      <div className="grid w-full max-w-5xl grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((revealed, i) => {
          const { card, orientation } = revealed;
          return (
            <motion.div
              key={card.id}
              className="flex flex-col items-center"
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.12, type: 'spring', stiffness: 120 }}
              style={{ perspective: 800 }}
            >
              <div
                className="overflow-hidden rounded-lg border border-gold/40 shadow-glow"
                style={{ transform: orientation === 'reversed' ? 'rotate(180deg)' : undefined }}
              >
                <img
                  src={cardImage(card.imageKey)}
                  alt={revealedCardLabel(revealed, lang, t)}
                  className="block w-full"
                  draggable={false}
                />
              </div>
              <p className="mt-3 text-center font-serif text-base text-white">
                {revealedCardLabel(revealed, lang, t)}
              </p>
            </motion.div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-10 rounded-full border border-lavender/60 px-6 py-2 font-sans text-white/90 transition-colors hover:bg-white/10"
      >
        {t('reveal.back')}
      </button>
    </div>
  );
}
