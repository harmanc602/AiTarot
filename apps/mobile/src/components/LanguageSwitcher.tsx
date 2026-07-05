import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, colors, fonts, type Language } from '@aitarot/core';

/** Globe icon, mirrors the web switcher's motif. */
function GlobeIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <Circle cx={12} cy={12} r={9} stroke={colors.gold} strokeWidth={1.8} />
      <Path d="M3 12h18" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z"
        stroke={colors.gold}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Language switcher: a globe-icon button that opens a dropdown list of the
 * available languages. Picking a language or tapping outside the list (the
 * transparent Modal backdrop) closes it — mirroring the web switcher.
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language as Language;
  const [open, setOpen] = useState(false);

  const pick = (lng: Language) => {
    void i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('language.label')}
        style={styles.iconButton}
      >
        <GlobeIcon />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Full-screen backdrop: tapping anywhere outside the menu closes it. */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Stop propagation so taps on the menu itself don't dismiss it. */}
          <Pressable
            style={styles.menu}
            accessibilityRole="menu"
            accessibilityLabel={t('language.label')}
            onPress={() => {}}
          >
            {LANGUAGES.map((lng) => {
              const active = current === lng;
              return (
                <Pressable
                  key={lng}
                  onPress={() => pick(lng)}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: active }}
                  style={[styles.item, active && styles.itemActive]}
                >
                  <Text style={[styles.label, active && styles.labelActive]}>
                    {t(`language.${lng}`)}
                  </Text>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.4)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: { flex: 1 },
  menu: {
    position: 'absolute',
    top: 96,
    right: 20,
    minWidth: 150,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.4)',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  item: { paddingHorizontal: 16, paddingVertical: 10 },
  itemActive: { backgroundColor: colors.gold },
  label: { color: 'rgba(240,240,255,0.85)', fontSize: 14, fontFamily: fonts.sans },
  labelActive: { color: colors.black, fontWeight: '600' },
});
