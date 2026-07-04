import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DECK,
  canConfirm,
  getCardById,
  revealCards,
  toggleSelection,
  type RevealedCard,
} from '@aitarot/core';
import CardWheel from './components/CardWheel';
import EnterButton from './components/EnterButton';
import LanguageSwitcher from './components/LanguageSwitcher';
import RevealPage from './components/RevealPage';
import Toast from './components/Toast';

type Screen = 'pick' | 'reveal';

const TOAST_MS = 2600;

export default function App() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<Screen>('pick');
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<RevealedCard[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const handleSelect = useCallback(
    (cardId: string) => {
      setSelected((prev) => {
        const { selection, rejected } = toggleSelection(prev, cardId);
        if (rejected) showToast(t('toast.maxCards'));
        return selection;
      });
    },
    [showToast, t],
  );

  const handleEnter = useCallback(() => {
    // Resolve ids -> cards in pick order, then assign random orientations once.
    const picked = selected.map((id) => getCardById(id)).filter(Boolean) as typeof DECK;
    setRevealed(revealCards(picked));
    setScreen('reveal');
  }, [selected]);

  const handleBack = useCallback(() => {
    setSelected([]);
    setRevealed([]);
    setScreen('pick');
  }, []);

  if (screen === 'reveal') {
    return <RevealPage cards={revealed} onBack={handleBack} />;
  }

  return (
    <div className="starfield relative z-10 flex h-full flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <span className="font-display text-xl font-bold tracking-wide text-gold">
          {t('app.title')}
        </span>
        <LanguageSwitcher />
      </header>

      {/* Instruction + Enter button, pinned above the wheel. */}
      <div className="flex flex-col items-center gap-4 px-4 pt-2 text-center">
        <p className="max-w-md font-serif text-lg text-white/90 sm:text-xl">
          {t('picker.instruction')}
        </p>
        <div className="h-12">
          <EnterButton
            visible={canConfirm(selected)}
            count={selected.length}
            onEnter={handleEnter}
          />
        </div>
      </div>

      {/* The wheel fills the remaining space; only its upper arc shows. */}
      <div className="relative flex flex-1 items-end justify-center">
        <CardWheel selected={selected} onSelect={handleSelect} />
      </div>

      <Toast message={toast} />
    </div>
  );
}
