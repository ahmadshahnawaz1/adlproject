/**
 * ZakatSettingsSheet — everything that shapes the ruling, in one bottom sheet:
 * the metal prices (typed by hand or refreshed online in one tap), the niṣāb
 * standard, the jewellery and debt positions, the long-term-shares method, the
 * calendar the year is counted on, the currency, and the ḥawl (zakat date).
 *
 * Nothing here asserts a single madhab — each choice is the user's, with a
 * short note on what's more cautious or more commonly encouraged.
 */
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { X, RefreshCw, CalendarClock, AlertTriangle, Check } from 'lucide-react-native';
import type {
  DebtPolicy,
  NisabStandard,
  StocksMethod,
  YearType,
  ZakatSettings,
} from '../content/zakat/zakat';
import { hawlStatus } from '../lib/zakat';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const PROXY_OPTIONS = [10, 25, 30, 50, 100];
const PRICE_STALE_DAYS = 7;

function Seg({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.segBtn, selected && styles.segBtnActive, pressed && styles.pressed]}
    >
      <Text style={[styles.segText, selected && styles.segTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function PriceInput({
  label,
  value,
  currency,
  onChange,
}: {
  label: string;
  value: number;
  currency: string;
  onChange: (n: number) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [text, setText] = useState(value ? String(value) : '');
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>{label}</Text>
      <View style={styles.priceBox}>
        <Text style={styles.unit}>{currency}/g</Text>
        <TextInput
          style={styles.priceInput}
          value={text}
          onChangeText={(t) => {
            setText(t);
            const n = parseFloat(t.replace(/[^0-9.]/g, ''));
            onChange(isFinite(n) ? n : 0);
          }}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="0"
          placeholderTextColor={colors.subtleForeground}
          selectionColor={colors.primary}
          maxLength={10}
        />
      </View>
    </View>
  );
}

function pricesStale(updatedAt: string | null): boolean {
  if (!updatedAt) return true;
  const days = (Date.now() - new Date(updatedAt).getTime()) / 86_400_000;
  return days > PRICE_STALE_DAYS;
}

function relativeUpdated(updatedAt: string | null): string {
  if (!updatedAt) return 'Prices not yet updated';
  const mins = Math.round((Date.now() - new Date(updatedAt).getTime()) / 60_000);
  if (mins < 1) return 'Updated just now';
  if (mins < 60) return `Updated ${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Updated ${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
}

export default function ZakatSettingsSheet({
  visible,
  settings,
  onClose,
  onSetSetting,
  onResetAll,
  onFetchPrices,
  fetching = false,
  fetchNote,
}: {
  visible: boolean;
  settings: ZakatSettings;
  onClose: () => void;
  onSetSetting: <K extends keyof ZakatSettings>(key: K, value: ZakatSettings[K]) => void;
  onResetAll: () => void;
  onFetchPrices: () => void;
  fetching?: boolean;
  fetchNote?: string | null;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [currencyText, setCurrencyText] = useState(settings.currency);
  const hawl = hawlStatus(settings.hawlStartISO);
  const stale = pricesStale(settings.pricesUpdatedAt);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Zakat settings</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Metal prices */}
          <Text style={styles.sectionLabel}>Gold &amp; silver prices</Text>
          <PriceInput
            label="Gold (per gram, pure)"
            value={settings.goldPerGram}
            currency={settings.currency}
            onChange={(n) => onSetSetting('goldPerGram', n)}
          />
          <PriceInput
            label="Silver (per gram)"
            value={settings.silverPerGram}
            currency={settings.currency}
            onChange={(n) => onSetSetting('silverPerGram', n)}
          />
          <Pressable
            onPress={onFetchPrices}
            disabled={fetching}
            style={({ pressed }) => [styles.fetchBtn, pressed && styles.pressed, fetching && styles.fetchBtnBusy]}
          >
            <RefreshCw size={15} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.fetchText}>{fetching ? 'Updating…' : 'Update prices online'}</Text>
          </Pressable>
          <Text style={styles.note}>
            {fetchNote ?? relativeUpdated(settings.pricesUpdatedAt)}
            {settings.priceSource ? `  ·  ${settings.priceSource}` : ''}
          </Text>
          {stale ? (
            <View style={styles.reminder}>
              <AlertTriangle size={14} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.reminderText}>
                Prices may be out of date — refresh before you calculate for accuracy.
              </Text>
            </View>
          ) : null}

          {/* Niṣāb standard */}
          <Text style={styles.sectionLabel}>Niṣāb standard</Text>
          <View style={styles.segment}>
            {(['silver', 'gold'] as NisabStandard[]).map((s) => (
              <Seg
                key={s}
                label={s === 'silver' ? 'Silver' : 'Gold'}
                selected={settings.nisabStandard === s}
                onPress={() => onSetSetting('nisabStandard', s)}
              />
            ))}
          </View>
          <Text style={styles.note}>
            Silver is the lower threshold, so more people qualify and more reaches the poor — the more
            cautious and widely-encouraged choice. Gold is also valid.
          </Text>

          {/* Jewellery */}
          <View style={styles.toggleRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Count personal jewellery</Text>
              <Text style={styles.rowSub}>On = Ḥanafī / cautious · Off = exempt everyday jewellery</Text>
            </View>
            <Switch
              value={settings.jewelryZakatable}
              onValueChange={(v) => onSetSetting('jewelryZakatable', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.foreground}
            />
          </View>

          {/* Debt policy */}
          <Text style={styles.sectionLabel}>Debts deducted</Text>
          <View style={styles.segment}>
            {(['dueNow', 'twelveMonth', 'none'] as DebtPolicy[]).map((d) => (
              <Seg
                key={d}
                label={d === 'dueNow' ? 'Due now' : d === 'twelveMonth' ? '12 months' : 'None'}
                selected={settings.debtPolicy === d}
                onPress={() => onSetSetting('debtPolicy', d)}
              />
            ))}
          </View>
          <Text style={styles.note}>
            Most contemporary scholars deduct debts due within the coming year, not the whole long-term balance.
          </Text>

          {/* Long-term shares */}
          <Text style={styles.sectionLabel}>Long-term shares</Text>
          <View style={styles.segment}>
            {(['proxy', 'full', 'dividends'] as StocksMethod[]).map((m) => (
              <Seg
                key={m}
                label={m === 'proxy' ? 'Proxy %' : m === 'full' ? 'Full value' : 'Dividends'}
                selected={settings.stocksMethod === m}
                onPress={() => onSetSetting('stocksMethod', m)}
              />
            ))}
          </View>
          {settings.stocksMethod === 'proxy' ? (
            <>
              <Text style={styles.note}>Zakatable share of each holding (a common estimate is 25–30%).</Text>
              <View style={[styles.segment, { marginTop: spacing.sm }]}>
                {PROXY_OPTIONS.map((p) => (
                  <Seg
                    key={p}
                    label={`${p}%`}
                    selected={settings.stocksProxyPct === p}
                    onPress={() => onSetSetting('stocksProxyPct', p)}
                  />
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.note}>
              {settings.stocksMethod === 'full'
                ? 'Pays on the full market value — the most cautious method.'
                : 'Pays only on dividends received (record those under cash).'}
            </Text>
          )}

          {/* Calendar */}
          <Text style={styles.sectionLabel}>Zakat year</Text>
          <View style={styles.segment}>
            {(['lunar', 'solar'] as YearType[]).map((y) => (
              <Seg
                key={y}
                label={y === 'lunar' ? 'Lunar · 2.5%' : 'Solar · 2.5775%'}
                selected={settings.yearType === y}
                onPress={() => onSetSetting('yearType', y)}
              />
            ))}
          </View>

          {/* Currency */}
          <Text style={styles.sectionLabel}>Currency</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>3-letter code</Text>
            <View style={styles.priceBox}>
              <TextInput
                style={[styles.priceInput, { textAlign: 'center' }]}
                value={currencyText}
                onChangeText={(t) => {
                  const code = t.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                  setCurrencyText(code);
                  if (code.length === 3) onSetSetting('currency', code);
                }}
                autoCapitalize="characters"
                placeholder="USD"
                placeholderTextColor={colors.subtleForeground}
                selectionColor={colors.primary}
                maxLength={3}
              />
            </View>
          </View>

          {/* Ḥawl / zakat date */}
          <Text style={styles.sectionLabel}>Your zakat date (ḥawl)</Text>
          <View style={styles.hawlRow}>
            <CalendarClock size={16} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.hawlText}>
              {settings.hawlStartISO
                ? hawl.complete
                  ? 'A lunar year has passed — your zakat is due.'
                  : `${hawl.daysRemaining} days until your zakat is due.`
                : 'Set the date your wealth first reached niṣāb.'}
            </Text>
          </View>
          <View style={styles.hawlBtns}>
            <Pressable
              onPress={() => onSetSetting('hawlStartISO', new Date().toISOString())}
              style={({ pressed }) => [styles.hawlBtn, pressed && styles.pressed]}
            >
              <Check size={14} color={colors.primaryForeground} strokeWidth={2.5} />
              <Text style={styles.hawlBtnText}>Set to today</Text>
            </Pressable>
            {settings.hawlStartISO ? (
              <Pressable
                onPress={() => onSetSetting('hawlStartISO', null)}
                style={({ pressed }) => [styles.hawlClear, pressed && styles.resetPressed]}
              >
                <Text style={styles.hawlClearText}>Clear</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Reset */}
          <Pressable
            onPress={onResetAll}
            style={({ pressed }) => [styles.reset, pressed && styles.resetPressed]}
          >
            <Text style={styles.resetText}>Reset worksheet &amp; settings</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '90%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { ...typography.title, color: colors.foreground },
  close: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: spacing.lg },

  sectionLabel: {
    ...typography.label,
    color: colors.subtleForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  note: { ...typography.caption, color: colors.subtleForeground, lineHeight: 18, marginTop: spacing.sm },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  priceLabel: { ...typography.body, fontSize: 14, color: colors.foreground, flex: 1 },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 130,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.input,
    paddingHorizontal: spacing.sm,
  },
  unit: { ...typography.caption, fontSize: 12, color: colors.subtleForeground },
  priceInput: {
    flex: 1,
    height: '100%',
    color: colors.foreground,
    ...typography.body,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },

  fetchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    backgroundColor: `${colors.primary}12`,
  },
  fetchBtnBusy: { opacity: 0.7 },
  fetchText: { ...typography.button, color: colors.primary },

  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}12`,
  },
  reminderText: { ...typography.caption, color: colors.foreground, flex: 1, lineHeight: 18 },

  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
  },
  segBtn: { flex: 1, paddingVertical: spacing.sm + 1, borderRadius: radius.sm, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.primary },
  segText: { ...typography.label, fontSize: 12, color: colors.mutedForeground },
  segTextActive: { color: colors.primaryForeground, fontWeight: '700' },
  pressed: { opacity: 0.7 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  rowText: { flex: 1, paddingRight: spacing.lg },
  rowLabel: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.foreground },
  rowSub: { ...typography.caption, color: colors.subtleForeground, marginTop: 2 },

  hawlRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hawlText: { ...typography.caption, color: colors.foreground, flex: 1, lineHeight: 18 },
  hawlBtns: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  hawlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  hawlBtnText: { ...typography.button, color: colors.primaryForeground, fontWeight: '700' },
  hawlClear: {
    paddingHorizontal: spacing.lg,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hawlClearText: { ...typography.label, color: colors.mutedForeground },

  reset: {
    marginTop: spacing['2xl'],
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetPressed: { backgroundColor: colors.cardElevated },
  resetText: { ...typography.label, color: colors.mutedForeground },
});
