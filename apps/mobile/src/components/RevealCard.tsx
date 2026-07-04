import { useEffect } from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { revealedCardLabel, colors, fonts, type Language, type RevealedCard } from '@aitarot/core';
import { cardImage } from '../cardImages';

interface RevealCardProps {
  reveal: RevealedCard;
  index: number;
}

/**
 * A single revealed card: flips in (rotateY), respects upright/reversed
 * orientation, and shows its localized label below.
 */
export default function RevealCard({ reveal, index }: RevealCardProps) {
  const { t, i18n } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const lang = i18n.language as Language;
  const { card, orientation } = reveal;

  // Two cards per row on phones, wider gutters on tablets.
  const width = Math.min((screenWidth - 16 * 2 - 18) / 2, 180);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(index * 120, withTiming(1, { duration: 500 }));
  }, [index, progress]);

  const flipStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ rotateY: `${(1 - progress.value) * 180}deg` }],
  }));

  const label = revealedCardLabel(reveal, lang, t);

  return (
    <View style={[styles.wrap, { width }]}>
      <Animated.View style={flipStyle}>
        <Image
          source={cardImage(card.imageKey)}
          accessibilityLabel={label}
          resizeMode="contain"
          style={[
            styles.image,
            { width, height: width * 1.6 },
            orientation === 'reversed' && styles.reversed,
          ]}
        />
      </Animated.View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 20 },
  image: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.4)',
  },
  reversed: { transform: [{ rotate: '180deg' }] },
  label: {
    marginTop: 8,
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.serif,
    textAlign: 'center',
  },
});
