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
    <div className="starfield relative z-10 flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between px-5 py-4">
        <span className="font-display text-xl font-bold tracking-wide text-gold">
          {t('app.title')}
        </span>
        <LanguageSwitcher />
      </header>

      {/* Two-part split via flex, no JS-measured heights (so it can't drift when
          this screen remounts after "draw again"). Upper part takes only the
          content it needs; the wheel gets ALL remaining height and sizes its fan
          to fill that band — so the ratio stays responsive on any viewport. */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Upper part: instruction + Enter button. shrink-0 → only as tall as
            its content, centered, never eating the wheel's room. */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-4 px-4 py-3 text-center">
          <p className="font-serif text-lg text-white/90 sm:text-xl">
            {/* dangerouslySetInnerHTML so the <wbr /> in ja.json breaks the line
                cleanly after the comma if wrapping is needed (on narrow screens),
                but on wide screens the whole instruction stays on one line. */}
            <span dangerouslySetInnerHTML={{ __html: t('picker.instruction') }} />
          </p>
          <div className="h-12">
            <EnterButton visible={canConfirm(selected)} onEnter={handleEnter} />
          </div>
        </div>

        {/* Lower part: the card wheel fills the rest. Only the upper arc shows;
            the band clips the rest so nothing spills into the text above. */}
        <div className="relative min-h-0 w-full flex-1 overflow-hidden">
          <CardWheel selected={selected} onSelect={handleSelect} />
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
