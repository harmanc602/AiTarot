import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '@aitarot/core';

interface EnterButtonProps {
  visible: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Confirm button that fades/scales in only when at least one card is selected.
 * Mirrors the web EnterButton behaviour.
 */
export default function EnterButton({ visible, onPress }: EnterButtonProps) {
  const { t } = useTranslation();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: 300 });
  }, [visible, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.9 + progress.value * 0.1 }],
  }));

  return (
    <AnimatedPressable
      style={[styles.button, style]}
      onPress={visible ? onPress : undefined}
      disabled={!visible}
      accessibilityRole="button"
    >
      <Text style={styles.label}>{t('picker.enter')}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.6)',
    backgroundColor: 'rgba(245,200,66,0.12)',
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  label: {
    color: colors.gold,
    fontSize: 16,
    fontFamily: fonts.serif,
    letterSpacing: 1,
  },
});
