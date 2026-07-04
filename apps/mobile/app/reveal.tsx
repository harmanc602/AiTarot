import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { DECK, revealCards, colors, fonts } from '@aitarot/core';
import RevealCard from '../src/components/RevealCard';
import { readSelection } from '../src/revealStore';

/**
 * Reveal screen: turns the committed selection into face-up cards, each with a
 * random upright/reversed orientation (decided once, here, via `revealCards`).
 */
export default function RevealScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  // Resolve selected ids to cards and fix orientations once per mount.
  const reveals = useMemo(() => {
    const ids = readSelection();
    const cards = ids
      .map((id) => DECK.find((c) => c.id === id))
      .filter((c): c is (typeof DECK)[number] => Boolean(c));
    return revealCards(cards);
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('reveal.title')}</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>{t('reveal.back')}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {reveals.map((r, i) => (
          <RevealCard key={r.card.id} reveal={r} index={i} />
        ))}
      </ScrollView>
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
    paddingVertical: 14,
  },
  title: { color: colors.gold, fontSize: 22, fontFamily: fonts.display, letterSpacing: 1 },
  back: { color: 'rgba(240,240,255,0.75)', fontSize: 15, fontFamily: fonts.serif },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
