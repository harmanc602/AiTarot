import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { canConfirm, toggleSelection, colors, fonts } from '@aitarot/core';
import CardWheel from '../src/components/CardWheel';
import EnterButton from '../src/components/EnterButton';
import LanguageSwitcher from '../src/components/LanguageSwitcher';
import Toast from '../src/components/Toast';
import { commitSelection } from '../src/revealStore';

const TOAST_MS = 2600;

/** Picker screen: instruction, Enter button, and the interactive card wheel. */
export default function PickerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
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
    commitSelection(selected);
    router.push('/reveal');
  }, [router, selected]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.brand}>{t('app.title')}</Text>
        <LanguageSwitcher />
      </View>

      <View style={styles.top}>
        <Text style={styles.instruction}>{t('picker.instruction')}</Text>
        <View style={styles.enterSlot}>
          <EnterButton visible={canConfirm(selected)} onPress={handleEnter} />
        </View>
      </View>

      <View style={styles.wheelArea}>
        <CardWheel selected={selected} onSelect={handleSelect} />
      </View>

      <Toast message={toast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brand: { color: colors.gold, fontSize: 20, fontFamily: fonts.display, letterSpacing: 1 },
  top: { alignItems: 'center', paddingHorizontal: 16, gap: 16 },
  instruction: {
    color: 'rgba(240,240,255,0.9)',
    fontSize: 18,
    fontFamily: fonts.serif,
    textAlign: 'center',
    maxWidth: 340,
  },
  enterSlot: { height: 52, justifyContent: 'center' },
  wheelArea: { flex: 1, justifyContent: 'flex-end' },
});
