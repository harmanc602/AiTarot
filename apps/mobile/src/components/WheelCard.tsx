import { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

interface WheelCardProps {
  /** Offset from the hub center, in px. */
  x: number;
  y: number;
  /** Tangential tilt so the card points outward like a spoke. */
  rotate: number;
  width: number;
  height: number;
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
}

/**
 * A single card fixed on the wheel rim. Positioned once relative to the hub via
 * translate + rotate; when selected it lifts slightly outward (toward the rim)
 * and scales up. The parent ring container is what actually rotates, so these
 * transforms are static — cards slide with the wheel rather than re-animating.
 */
export default function WheelCard({
  x,
  y,
  rotate,
  width,
  height,
  selected,
  onPress,
  children,
}: WheelCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.card,
        {
          width,
          height,
          marginLeft: -width / 2,
          marginTop: -height / 2,
          transform: [
            { translateX: x },
            { translateY: y },
            { rotate: `${rotate}deg` },
            // Slide selected cards outward along their own radial axis: after
            // the rotate, -Y points away from the hub (the local card frame).
            { translateY: selected ? -height * 0.2 : 0 },
          ],
        },
        selected && styles.selected,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { position: 'absolute', backgroundColor: 'transparent' },
  selected: {
    shadowColor: '#c9b6ff',
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    borderRadius: 10,
    elevation: 12,
  },
});
