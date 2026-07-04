import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '@aitarot/core';

interface ToastProps {
  message: string | null;
}

/**
 * Non-blocking toast pinned near the bottom. Fades/slides in when `message` is
 * set; the parent clears it on a timer. Never blocks interaction.
 */
export default function Toast({ message }: ToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const show = message != null;
    opacity.value = withTiming(show ? 1 : 0, { duration: 250 });
    translateY.value = withTiming(show ? 0 : 20, { duration: 250 });
  }, [message, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, style]}>
      {message ? (
        <Text style={styles.text} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    maxWidth: '90%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.5)',
    backgroundColor: 'rgba(26,10,61,0.92)',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  text: { color: colors.white, fontSize: 14, fontFamily: fonts.sans, textAlign: 'center' },
});
