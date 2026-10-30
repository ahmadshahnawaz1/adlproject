/**
 * PilgrimageNotesCard — the surrounding wisdom of the journey: its virtues (to
 * draw the heart), its manners (to beautify the rites), and its common mistakes
 * (to protect them). A small segmented control switches between the three, and
 * a standing disclaimer keeps the app honest about its limits. Each note may
 * carry its evidence.
 */
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  PILGRIMAGE_ADAB,
  PILGRIMAGE_DISCLAIMER,
  PILGRIMAGE_MISTAKES,
  PILGRIMAGE_VIRTUES,
} from '../content/pilgrimage';
import type { GuidanceNote } from '../content/pilgrimage';
import { colors, fontFamily, radius, spacing, typography } from '../theme/tokens';
import DaleelBlock from './DaleelBlock';

type TabKey = 'virtues' | 'adab' | 'mistakes';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'virtues', label: 'Virtues' },
  { key: 'adab', label: 'Manners' },
  { key: 'mistakes', label: 'Mistakes' },
];

export default function PilgrimageNotesCard({ haptics = true }: { haptics?: boolean }) {
  const [tab, setTab] = useState<TabKey>('virtues');

  const notes: GuidanceNote[] = useMemo(() => {
    switch (tab) {
      case 'adab':
        return PILGRIMAGE_ADAB;
      case 'mistakes':
        return PILGRIMAGE_MISTAKES;
      default:
        return PILGRIMAGE_VIRTUES;
    }
  }, [tab]);

  const pick = (k: TabKey) => {
    if (haptics) Haptics.selectionAsync().catch(() => {});
    setTab(k);
  };

  const isMistakes = tab === 'mistakes';

  return (
    <View style={styles.wrap}>
      <View style={styles.segment}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable key={t.key} onPress={() => pick(t.key)} style={[styles.segmentItem, active && styles.segmentItemActive]} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: spacing.md }}>
        {notes.map((n) => (
          <View key={n.id} style={[styles.note, isMistakes && styles.noteMistake]}>
            <View style={styles.noteHead}>
              <Text style={[styles.noteMark, isMistakes ? styles.noteMarkMistake : styles.noteMarkVirtue]}>{isMistakes ? '✕' : '✦'}</Text>
              <Text style={styles.noteTitle}>{n.title}</Text>
            </View>
            <Text style={styles.noteText}>{n.text}</Text>
            {n.daleel ? (
              <View style={styles.noteDaleel}>
                <DaleelBlock daleel={n.daleel} />
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>{PILGRIMAGE_DISCLAIMER}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  segment: { flexDirection: 'row', backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 3, gap: 3 },
  segmentItem: { flex: 1, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segmentItemActive: { backgroundColor: colors.cardElevated, borderWidth: 1, borderColor: colors.border },
  segmentText: { fontFamily, fontSize: typography.label.fontSize, fontWeight: '600', color: colors.subtleForeground },
  segmentTextActive: { color: colors.foreground },
  note: { backgroundColor: colors.cardElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  noteMistake: { borderColor: 'rgba(239,68,68,0.25)' },
  noteHead: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  noteMark: { fontFamily, fontSize: typography.body.fontSize, lineHeight: 22 },
  noteMarkVirtue: { color: colors.primary },
  noteMarkMistake: { color: colors.destructive },
  noteTitle: { flex: 1, fontFamily, fontSize: typography.body.fontSize, fontWeight: '700', color: colors.foreground, lineHeight: 22 },
  noteText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 20, color: colors.mutedForeground },
  noteDaleel: { marginTop: 2 },
  disclaimer: { backgroundColor: colors.input, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  disclaimerText: { fontFamily, fontSize: typography.caption.fontSize, lineHeight: 19, color: colors.subtleForeground, fontStyle: 'italic' },
});
