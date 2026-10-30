/**
 * TafsirSheet — a themed bottom sheet showing one ayah's tafsīr.
 *
 * The active commentary is fetched per-ayah and cached for offline re-reads.
 * A horizontal picker switches between the curated tafsīr editions (across
 * English, Arabic, Urdu, and Bengali); the body scrolls cleaned plain text
 * with loading, error+retry, and source-attribution states.
 */
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RotateCw, X } from 'lucide-react-native';
import { TAFSIRS, getTafsir } from '../../content/quran';
import { getTafsirText } from '../../lib/quranTafsirStore';
import { toArabicDigits } from '../../lib/quran';
import type { ReaderTheme } from '../../theme/quranReaderThemes';
import { fontFamily, radius, spacing } from '../../theme/tokens';

export default function TafsirSheet({
  visible,
  surah,
  ayah,
  surahName,
  tafsirId,
  onSelectTafsir,
  theme,
  onClose,
}: {
  visible: boolean;
  surah: number;
  ayah: number;
  surahName: string;
  tafsirId: string;
  onSelectTafsir: (id: string) => void;
  theme: ReaderTheme;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const active = getTafsir(tafsirId) ?? TAFSIRS[0];
  const isArabic = active.language === 'Arabic' || active.language === 'Urdu';

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    setLoading(true);
    setError(false);
    setText('');
    (async () => {
      try {
        const result = await getTafsirText(active.id, surah, ayah);
        if (alive) {
          setText(result);
          setLoading(false);
          scrollRef.current?.scrollTo({ y: 0, animated: false });
        }
      } catch {
        if (alive) {
          setError(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [visible, active.id, surah, ayah, attempt]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.kicker, { color: theme.subtle }]}>TAFSĪR</Text>
              <Text style={[styles.ref, { color: theme.text }]}>
                {surahName} · {toArabicDigits(surah)}:{toArabicDigits(ayah)}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
              <X size={18} color={theme.muted} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {TAFSIRS.map((t) => {
              const on = t.id === active.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => onSelectTafsir(t.id)}
                  style={[
                    styles.chip,
                    { borderColor: theme.border },
                    on && { backgroundColor: theme.accent, borderColor: theme.accent },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: on ? theme.accentText : theme.muted },
                    ]}
                    numberOfLines={1}
                  >
                    {t.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView
            ref={scrollRef}
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.state}>
                <ActivityIndicator color={theme.accent} />
                <Text style={[styles.stateText, { color: theme.subtle }]}>
                  Loading tafsīr…
                </Text>
              </View>
            ) : error ? (
              <View style={styles.state}>
                <Text style={[styles.stateText, { color: theme.subtle }]}>
                  Couldn’t load this tafsīr. Check your connection.
                </Text>
                <Pressable
                  onPress={() => setAttempt((n) => n + 1)}
                  style={[styles.retry, { borderColor: theme.border }]}
                >
                  <RotateCw size={15} color={theme.accent} />
                  <Text style={[styles.retryText, { color: theme.text }]}>
                    Retry
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Text
                style={[
                  styles.text,
                  { color: theme.text },
                  isArabic && styles.rtl,
                ]}
              >
                {text}
              </Text>
            )}
          </ScrollView>

          <Text style={[styles.attribution, { color: theme.subtle }]}>
            {active.author} · loaded on demand, cached offline
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  kicker: { fontFamily, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  ref: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { gap: spacing.sm, paddingVertical: spacing.md, paddingRight: spacing.lg },
  chip: {
    maxWidth: 200,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: { fontFamily, fontSize: 13, fontWeight: '500' },
  bodyScroll: { marginTop: spacing.xs },
  bodyContent: { paddingVertical: spacing.md, minHeight: 160 },
  state: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['2xl'] },
  stateText: {
    fontFamily,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  retryText: { fontFamily, fontSize: 14, fontWeight: '600' },
  text: { fontFamily, fontSize: 16, lineHeight: 28 },
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
  attribution: {
    fontFamily,
    fontSize: 11.5,
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
});
