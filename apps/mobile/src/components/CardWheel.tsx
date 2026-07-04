import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
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
  selected: string[];
  onSelect: (cardId: string) => void;
}

const CARD_WIDTH = 84;
const STEP_DEG = 6.2;

/**
 * Native card wheel. A Pan gesture updates a Reanimated shared value on the UI
 * thread; a `useAnimatedReaction` mirrors it into React state so the visible
 * subset of cards re-renders. Only the upper arc is shown because the wheel's
 * center is placed below the viewport. Rotation math is shared via
 * `@aitarot/core`.
 */
export default function CardWheel({ selected, onSelect }: CardWheelProps) {
  const { width } = useWindowDimensions();
  // Radius scales with screen width so the arc looks right on any device.
  const radius = Math.max(width * 1.35, 480);
  const layout = useMemo(() => makeWheelLayout(DECK.length, STEP_DEG, 70), []);

  const rotation = useSharedValue(0);
  const startRotation = useSharedValue(0);
  const [rot, setRot] = useState(0);

  // Mirror the UI-thread rotation into React state to re-render visible cards.
  useAnimatedReaction(
    () => rotation.value,
    (value) => runOnJS(setRot)(value),
  );

  const pan = Gesture.Pan()
    .onBegin(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      const next = startRotation.value + dragToRotation(e.translationX);
      rotation.value = clampRotation(next, layout);
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.viewport} accessibilityRole="adjustable">
        {/* Wheel center sits below the viewport; cards fan across the top. */}
        <View style={[styles.hub, { top: '100%' }]}>
          {DECK.map((card, index) => {
            const angle = cardAngle(index, rot, layout);
            if (!isCardVisible(angle, layout)) return null;
            const { x, y, rotate } = cardTransform(angle, radius);
            const isSelected = selected.includes(card.id);
            return (
              <Pressable
                key={card.id}
                onPress={() => onSelect(card.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.card,
                  {
                    width: CARD_WIDTH,
                    marginLeft: -CARD_WIDTH / 2,
                    marginTop: -CARD_WIDTH * 0.75,
                    transform: [
                      { translateX: x },
                      { translateY: isSelected ? y - 20 : y },
                      { rotate: `${rotate}deg` },
                      { scale: isSelected ? 1.06 : 1 },
                    ],
                    zIndex: isSelected ? 999 : 100 - Math.round(Math.abs(angle)),
                  },
                  isSelected && styles.selected,
                ]}
              >
                <CardBack width={CARD_WIDTH} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, width: '100%', overflow: 'hidden' },
  hub: { position: 'absolute', left: '50%' },
  card: { position: 'absolute' },
  selected: {
    shadowColor: '#c9b6ff',
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    borderRadius: 10,
    elevation: 12,
  },
});
