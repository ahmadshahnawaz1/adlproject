/**
 * ReaderSettingsSheet — a bottom sheet for reader display preferences:
 * Arabic typeface, text size, line spacing, reader theme, the
 * transliteration / translation / word-by-word layers, which translations are
 * stacked (bundled + downloaded), the default tafsīr, and a door into the
 * translation library. Driven by the useQuranSettings controls passed in.
 */
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AudioLines, Check, ChevronRight, Library, Minus, Plus, X } from 'lucide-react-native';
import { BUNDLED_TRANSLATIONS, TAFSIRS } from '../../content/quran';
import {
  MAX_ARABIC_FONT,
  MIN_ARABIC_FONT,
  MAX_LINE_SPACING,
  MIN_LINE_SPACING,
  type ArabicFont,
  type UseQuranSettings,
} from '../../hooks/useQuranSettings';
import type { UseQuranDownloads } from '../../hooks/useQuranDownloads';
import { READER_THEME_LIST } from '../../theme/quranReaderThemes';
import SettingToggle from './SettingToggle';
import { colors, fontFamily, quranFontFamily, radius, spacing } from '../../theme/tokens';

const FONT_OPTIONS: { key: ArabicFont; label: string }[] = [
  { key: 'amiri', label: 'Amiri Quran' },
  { key: 'scheherazade', label: 'Scheherazade' },
];

const SAMPLE = 'بِسۡمِ ٱللَّهِ';

export default function ReaderSettingsSheet({
  visible,
  onClose,
  controls,
  downloads,
  onOpenLibrary,
  onOpenRecitation,
  onOpenTajweedLegend,
}: {
  visible: boolean;
  onClose: () => void;
  controls: UseQuranSettings;
  downloads: UseQuranDownloads;
  onOpenLibrary: () => void;
  onOpenRecitation?: () => void;
  onOpenTajweedLegend?: () => void;
}) {
  const { settings } = controls;
  const atMin = settings.arabicFontSize <= MIN_ARABIC_FONT;
  const atMax = settings.arabicFontSize >= MAX_ARABIC_FONT;
  const atMinSpacing = settings.lineSpacing <= MIN_LINE_SPACING;
  const atMaxSpacing = settings.lineSpacing >= MAX_LINE_SPACING;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.titleRow}>
            <Text style={styles.title}>Reader settings</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.section}>TYPEFACE</Text>
            <View style={styles.fontRow}>
              {FONT_OPTIONS.map((opt) => {
                const active = settings.arabicFont === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => controls.setArabicFont(opt.key)}
                    style={[styles.fontCard, active && styles.fontCardActive]}
                  >
                    <Text
                      style={[
                        styles.fontSample,
                        { fontFamily: quranFontFamily(opt.key) },
                      ]}
                      allowFontScaling={false}
                    >
                      {SAMPLE}
                    </Text>
                    <Text
                      style={[
                        styles.fontLabel,
                        active && styles.fontLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.section}>TEXT SIZE</Text>
            <View style={styles.sizeRow}>
              <Pressable
                onPress={controls.decreaseFont}
                disabled={atMin}
                style={[styles.stepBtn, atMin && styles.stepDisabled]}
              >
                <Minus size={18} color={colors.foreground} />
              </Pressable>
              <Text style={styles.sizeValue}>{settings.arabicFontSize}px</Text>
              <Pressable
                onPress={controls.increaseFont}
                disabled={atMax}
                style={[styles.stepBtn, atMax && styles.stepDisabled]}
              >
                <Plus size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <Text style={styles.section}>LINE SPACING</Text>
            <View style={styles.sizeRow}>
              <Pressable
                onPress={controls.decreaseLineSpacing}
                disabled={atMinSpacing}
                style={[styles.stepBtn, atMinSpacing && styles.stepDisabled]}
              >
                <Minus size={18} color={colors.foreground} />
              </Pressable>
              <Text style={styles.sizeValue}>
                {settings.lineSpacing.toFixed(1)}×
              </Text>
              <Pressable
                onPress={controls.increaseLineSpacing}
                disabled={atMaxSpacing}
                style={[styles.stepBtn, atMaxSpacing && styles.stepDisabled]}
              >
                <Plus size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <Text style={styles.section}>READER THEME</Text>
            <View style={styles.themeRow}>
              {READER_THEME_LIST.map((t) => {
                const active = settings.readerTheme === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => controls.setReaderTheme(t.key)}
                    style={[styles.themeCard, active && styles.themeCardActive]}
                  >
                    <View
                      style={[
                        styles.themeSwatch,
                        { backgroundColor: t.bg, borderColor: t.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.themeBar,
                          { backgroundColor: t.text, width: '78%' },
                        ]}
                      />
                      <View
                        style={[
                          styles.themeBar,
                          { backgroundColor: t.muted, width: '52%' },
                        ]}
                      />
                      <View
                        style={[styles.themeDot, { backgroundColor: t.accent }]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.themeLabel,
                        active && styles.themeLabelActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.section}>DISPLAY</Text>
            <SettingToggle
              label="Transliteration"
              value={settings.showTransliteration}
              onValueChange={controls.toggleTransliteration}
            />
            <SettingToggle
              label="Translation"
              value={settings.showTranslation}
              onValueChange={controls.toggleTranslation}
            />
            <SettingToggle
              label="Word by word"
              value={settings.showWordByWord}
              onValueChange={controls.toggleWordByWord}
            />
            <SettingToggle
              label="Tajwīd colours"
              hint="Colour the Arabic by its recitation rules."
              value={settings.showTajweed}
              onValueChange={controls.toggleTajweed}
              onInfo={onOpenTajweedLegend}
            />

            <Text style={styles.section}>TRANSLATION</Text>
            {BUNDLED_TRANSLATIONS.map((ed) => {
              const active = settings.translationIds.includes(ed.id);
              return (
                <Pressable
                  key={ed.id}
                  onPress={() => controls.toggleTranslationId(ed.id)}
                  style={[styles.transRow, active && styles.transRowActive]}
                >
                  <View style={styles.transText}>
                    <Text style={styles.transName}>{ed.name}</Text>
                    <Text style={styles.transAuthor}>{ed.author}</Text>
                  </View>
                  {active ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
            {downloads.records.map((ed) => {
              const active = settings.translationIds.includes(ed.id);
              return (
                <Pressable
                  key={ed.id}
                  onPress={() => controls.toggleTranslationId(ed.id)}
                  style={[styles.transRow, active && styles.transRowActive]}
                >
                  <View style={styles.transText}>
                    <Text style={styles.transName}>{ed.name}</Text>
                    <Text style={styles.transAuthor}>
                      {ed.language} · downloaded
                    </Text>
                  </View>
                  {active ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}

            <Pressable
              onPress={onOpenLibrary}
              style={({ pressed }) => [
                styles.libraryBtn,
                pressed && styles.pressed,
              ]}
            >
              <Library size={18} color={colors.primary} />
              <Text style={styles.libraryText}>Browse translation library</Text>
              <ChevronRight size={18} color={colors.subtleForeground} />
            </Pressable>

            {onOpenRecitation ? (
              <Pressable onPress={onOpenRecitation} style={({ pressed }) => [styles.libraryBtn, pressed && styles.pressed]}>
                <AudioLines size={18} color={colors.primary} />
                <Text style={styles.libraryText}>Recitation & offline audio</Text>
                <ChevronRight size={18} color={colors.subtleForeground} />
              </Pressable>
            ) : null}

            <Text style={styles.section}>DEFAULT TAFSĪR</Text>
            {TAFSIRS.map((t) => {
              const active = settings.tafsirId === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => controls.setTafsirId(t.id)}
                  style={[styles.transRow, active && styles.transRowActive]}
                >
                  <View style={styles.transText}>
                    <Text style={styles.transName}>{t.name}</Text>
                    <Text style={styles.transAuthor}>
                      {t.author} · {t.language}
                    </Text>
                  </View>
                  {active ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
            <Text style={styles.note}>
              Word-by-word, transliteration and Saheeh International ship offline.
              Tafsīr loads on demand per ayah, then stays cached for offline
              reading.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  content: { paddingBottom: spacing.lg, gap: spacing.sm },
  section: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.subtleForeground,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  fontRow: { flexDirection: 'row', gap: spacing.md },
  fontCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  fontCardActive: { borderColor: colors.primary, backgroundColor: colors.card },
  fontSample: { fontSize: 24, color: colors.foreground, writingDirection: 'rtl' },
  fontLabel: { fontFamily, fontSize: 12.5, color: colors.mutedForeground },
  fontLabelActive: { color: colors.foreground, fontWeight: '600' },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  stepBtn: {
    width: 44,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepDisabled: { opacity: 0.4 },
  sizeValue: {
    fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
  },
  transRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  transRowActive: { borderColor: colors.primary },
  transText: { gap: 2, flex: 1 },
  transName: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  transAuthor: { fontFamily, fontSize: 12.5, color: colors.subtleForeground },
  libraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    marginTop: spacing.sm,
  },
  libraryText: {
    flex: 1,
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  pressed: { opacity: 0.7 },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  themeCard: {
    alignItems: 'center',
    gap: 6,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    width: 84,
  },
  themeCardActive: { borderColor: colors.primary, backgroundColor: colors.card },
  themeSwatch: {
    width: '100%',
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 8,
    justifyContent: 'center',
    gap: 5,
  },
  themeBar: { height: 4, borderRadius: 2 },
  themeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  themeLabel: { fontFamily, fontSize: 12, color: colors.mutedForeground },
  themeLabelActive: { color: colors.foreground, fontWeight: '600' },
  note: {
    fontFamily,
    fontSize: 12.5,
    color: colors.subtleForeground,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
