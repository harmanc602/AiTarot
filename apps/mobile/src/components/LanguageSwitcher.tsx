import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, colors, fonts, type Language } from '@aitarot/core';

/** Compact language switcher for the mobile main screen. */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language as Language;

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={t('language.label')}>
      {LANGUAGES.map((lng) => {
        const active = current === lng;
        return (
          <Pressable
            key={lng}
            onPress={() => void i18n.changeLanguage(lng)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{t(`language.${lng}`)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.4)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  pillActive: { backgroundColor: colors.gold },
  label: { color: 'rgba(240,240,255,0.8)', fontSize: 13, fontFamily: fonts.sans },
  labelActive: { color: colors.black, fontWeight: '600' },
});
