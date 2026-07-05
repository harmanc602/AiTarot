import { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  DECK,
  cardBaseAngle,
  cardTransform,
  dragToRotation,
  makeWheelLayout,
  shuffle,
} from '@aitarot/core';
import CardBack from './CardBack';
import WheelCard from './WheelCard';

interface CardWheelProps {
  selected: string[];
  onSelect: (cardId: string) => void;
}

const VISIBLE_HALF_ARC = 54;

/**
 * Native card wheel — a *real* wheel. All 78 backs are placed once at fixed
 * positions around a full 360° ring; a Pan gesture rotates the whole ring
 * container (an Animated.View) on the UI thread. Cards slide along the arc
 * together and the ring is closed, so it spins forever with no end stop.
 *
 * Only the upper arc is visible: the hub sits below the band and the viewport
 * clips everything else. Rotation math is shared via `@aitarot/core`.
 */
export default function CardWheel({ selected, onSelect }: CardWheelProps) {
  const { width, height } = useWindowDimensions();
  const layout = useMemo(() => makeWheelLayout(DECK.length, VISIBLE_HALF_ARC), []);
  // Shuffle once per mount so the wheel isn't in canonical order every time.
  const deck = useMemo(() => shuffle(DECK), []);

  // Responsive sizing derived from the screen.
  const cardWidth = Math.max(96, Math.min(156, width / 3));
  const cardHeight = cardWidth * 1.5;
  const radius = Math.max(320, Math.min(width * 1.05, 620));
  const bandHeight = Math.min(height * 0.5, radius);
  const hubTop = radius + cardHeight * 0.35;

  const rotation = useSharedValue(0);
  const startRotation = useSharedValue(0);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      // Wheel follows the finger: drag right → the ring spins right, so the
      // cards under the finger travel the same way the hand moves. No clamp:
      // the ring is closed, so rotation loops forever.
      rotation.value = startRotation.value + dragToRotation(e.translationX);
    });

  // Rotate the whole ring; cards are positioned once relative to the hub.
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.viewport, { height: bandHeight }]} accessibilityRole="adjustable">
        <Animated.View style={[styles.hub, { top: hubTop }, ringStyle]}>
          {deck.map((card, index) => {
            const base = cardBaseAngle(index, layout);
            const { x, y, rotate } = cardTransform(base, radius);
            return (
              <WheelCard
                key={card.id}
                x={x}
                y={y}
                rotate={rotate}
                width={cardWidth}
                height={cardHeight}
                selected={selected.includes(card.id)}
                onPress={() => onSelect(card.id)}
              >
                <CardBack width={cardWidth} />
              </WheelCard>
            );
          })}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  viewport: { width: '100%', overflow: 'hidden' },
  hub: { position: 'absolute', left: '50%', width: 0, height: 0 },
});
