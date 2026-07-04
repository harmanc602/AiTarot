import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import { colors } from '@aitarot/core';
import '../src/i18n';

/**
 * Root layout: wraps the app in the gesture root, loads the mystical serif
 * fonts, and configures a headerless dark stack. i18n is initialized on import.
 */
export default function RootLayout() {
  const [loaded] = useFonts({
    Cinzel: Cinzel_600SemiBold,
    Cinzel_700Bold,
    'Cormorant Garamond': CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
  });

  useEffect(() => {
    // Fonts are optional for layout; nothing else to do once loaded.
  }, [loaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.black }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.black },
          animation: 'fade',
        }}
      />
    </GestureHandlerRootView>
  );
}
