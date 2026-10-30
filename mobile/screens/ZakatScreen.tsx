/**
 * ZakatScreen — the calm, evidence-cited zakat calculator.
 *
 * It holds the worksheet state and settings (persisted, fully offline), runs
 * the pure calculation on every change, and offers two ways through it: a
 * power-user worksheet or a guided, swipeable wizard. Metal prices can be
 * typed by hand or refreshed online in one tap. Tapping "See result" reveals
 * the full breakdown, the ḥawl status, and the eight Qurʾānic recipients.
 *
 * Nothing here issues a fatwa — every madhab-sensitive choice is the user's,
 * surfaced in settings with a short, sourced note.
 */
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, SlidersHorizontal, BellRing, ChevronRight } from 'lucide-react-native';
import { ZAKAT_GROUPS } from '../content/zakat/zakat';
import { ASNAF } from '../content/zakat/recipients';
import { computeZakat, hawlStatus } from '../lib/zakat';
import { fetchMetalPrices } from '../lib/metalPrices';
import type { CharityEntry, CharityInput } from '../lib/charity';
import useZakatWorksheet from '../hooks/useZakatWorksheet';
import useZakatReminder from '../hooks/useZakatReminder';
import type { UseCharityLog } from '../hooks/useCharityLog';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import ZakatWorksheet from '../components/ZakatWorksheet';
import ZakatWizard from '../components/ZakatWizard';
import ZakatResult from '../components/ZakatResult';
import ZakatSettingsSheet from '../components/ZakatSettingsSheet';
import SadaqahLogCard from '../components/sadaqah/SadaqahLogCard';
import SadaqahEntrySheet from '../components/sadaqah/SadaqahEntrySheet';
import ZakatDueReminderSheet from '../components/sadaqah/ZakatDueReminderSheet';

type Mode = 'worksheet' | 'wizard';
type ViewKind = 'input' | 'result';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ZakatScreen({
  onClose,
  onOpenSadaqah,
  charity,
}: {
  onClose?: () => void;
  onOpenSadaqah?: () => void;
  charity: UseCharityLog;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { values, settings, ready, setValue, setSetting, resetAll } = useZakatWorksheet();
  const reminder = useZakatReminder(settings.hawlStartISO);

  const [mode, setMode] = useState<Mode>('worksheet');
  const [view, setView] = useState<ViewKind>('input');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const [editing, setEditing] = useState<CharityEntry | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchNote, setFetchNote] = useState<string | null>(null);

  const computation = useMemo(() => computeZakat(values, settings), [values, settings]);
  const hawl = useMemo(() => hawlStatus(settings.hawlStartISO), [settings.hawlStartISO]);

  const openAddGift = () => {
    setEditing(null);
    setEntryOpen(true);
  };

  const submitGift = (input: CharityInput) => {
    if (editing) charity.edit(editing.id, input);
    else charity.addPayment(input);
    Haptics.selectionAsync().catch(() => {});
  };

  const seeResult = () => {
    Haptics.selectionAsync().catch(() => {});
    setView('result');
  };

  const fetchPrices = async () => {
    setFetching(true);
    setFetchNote(null);
    const prices = await fetchMetalPrices();
    setFetching(false);
    if (!prices) {
      setFetchNote("Couldn't reach the price service — check your connection or enter prices by hand.");
      return;
    }
    setSetting('goldPerGram', round2(prices.goldPerGram));
    setSetting('silverPerGram', round2(prices.silverPerGram));
    setSetting('pricesUpdatedAt', prices.fetchedAt);
    setSetting('priceSource', `${prices.source} · ${prices.currency}/g`);
    setSetting('priceMode', 'online');
    setFetchNote('Prices updated just now.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  if (!ready) {
    return (
      <View style={[styles.root, styles.loading]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <Text style={styles.headerTitle}>{view === 'result' ? 'Your zakat' : 'Zakat'}</Text>
        <Pressable onPress={() => setSettingsOpen(true)} hitSlop={12} style={styles.iconBtn}>
          <SlidersHorizontal size={18} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      {/* Mode toggle (input only) */}
      {view === 'input' ? (
        <View style={styles.segment}>
          {(['worksheet', 'wizard'] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[styles.segBtn, mode === m && styles.segBtnActive]}
            >
              <Text style={[styles.segText, mode === m && styles.segTextActive]}>
                {m === 'worksheet' ? 'Worksheet' : 'Guided'}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Body */}
      {view === 'result' ? (
        <ZakatResult
          computation={computation}
          settings={settings}
          hawl={hawl}
          onEdit={() => setView('input')}
          slot={
            <>
              <SadaqahLogCard
                charity={charity}
                currency={computation.currency}
                zakatDue={computation.zakatDue}
                hawlStartISO={settings.hawlStartISO}
                onAddPayment={openAddGift}
                onOpenAll={() => onOpenSadaqah?.()}
              />
              <Pressable
                onPress={() => setReminderOpen(true)}
                style={({ pressed }) => [styles.reminderRow, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Zakat-due reminder"
              >
                <BellRing
                  size={16}
                  color={reminder.prefs.enabled ? colors.primary : colors.mutedForeground}
                  strokeWidth={2.2}
                />
                <View style={styles.reminderText}>
                  <Text style={styles.reminderTitle}>Zakat-due reminder</Text>
                  <Text style={styles.reminderSub}>
                    {reminder.prefs.enabled && reminder.reminderDateISO
                      ? `On ${formatDate(reminder.reminderDateISO)}`
                      : 'Off · get nudged when your ḥawl completes'}
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.subtleForeground} strokeWidth={2.2} />
              </Pressable>
            </>
          }
        />
      ) : mode === 'worksheet' ? (
        <ZakatWorksheet
          groups={ZAKAT_GROUPS}
          values={values}
          settings={settings}
          computation={computation}
          onChange={setValue}
          onSeeResult={seeResult}
        />
      ) : (
        <ZakatWizard
          groups={ZAKAT_GROUPS}
          values={values}
          settings={settings}
          computation={computation}
          onChange={setValue}
          onSeeResult={seeResult}
        />
      )}

      <ZakatSettingsSheet
        visible={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSetSetting={setSetting}
        onResetAll={() => {
          resetAll();
          setView('input');
        }}
        onFetchPrices={fetchPrices}
        fetching={fetching}
        fetchNote={fetchNote}
      />

      <SadaqahEntrySheet
        visible={entryOpen}
        onClose={() => setEntryOpen(false)}
        currency={settings.currency}
        recipients={ASNAF}
        initial={editing}
        onSubmit={submitGift}
        onDelete={charity.remove}
      />

      <ZakatDueReminderSheet
        visible={reminderOpen}
        onClose={() => setReminderOpen(false)}
        prefs={reminder.prefs}
        dueDateISO={reminder.dueDateISO}
        reminderDateISO={reminder.reminderDateISO}
        onSetEnabled={reminder.setEnabled}
        onSetDaysBefore={reminder.setDaysBefore}
        onTest={reminder.sendTest}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: { ...typography.title, color: colors.foreground },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segment: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  segBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.primary },
  segText: { ...typography.label, color: colors.mutedForeground },
  segTextActive: { color: colors.primaryForeground, fontWeight: '700' },

  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  reminderText: { flex: 1, gap: 2 },
  reminderTitle: { ...typography.body, color: colors.foreground, fontWeight: '600' },
  reminderSub: { ...typography.caption, color: colors.mutedForeground },
  pressed: { opacity: 0.7 },
});
