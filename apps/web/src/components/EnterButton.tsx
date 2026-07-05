import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface EnterButtonProps {
  /** When true the button is mounted and fades in. */
  visible: boolean;
  onEnter: () => void;
}

/**
 * Enter / Confirm button. Appears (fades in) only when at least one card is
 * selected; sits above the wheel, below the instructional text.
 */
export default function EnterButton({ visible, onEnter }: EnterButtonProps) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={onEnter}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="rounded-full border border-gold bg-gold/90 px-8 py-2.5 font-display text-lg font-semibold text-black shadow-glow transition-colors hover:bg-gold"
        >
          {t('picker.enter')}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
