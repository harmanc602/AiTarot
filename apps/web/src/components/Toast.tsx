import { AnimatePresence, motion } from 'framer-motion';

interface ToastProps {
  message: string | null;
}

/**
 * Non-blocking inline notification (bottom-center). Renders when `message` is
 * set; the parent clears it on a timer. Not an alert — never interrupts input.
 */
export default function Toast({ message }: ToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="rounded-full border border-gold/50 bg-dark-purple/90 px-5 py-2.5 font-sans text-sm text-white shadow-glow backdrop-blur"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
