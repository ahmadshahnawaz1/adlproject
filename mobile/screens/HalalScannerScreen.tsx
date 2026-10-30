/**
 * HalalScannerScreen — scan a barcode, read the ingredients (F28).
 *
 * Open Food Facts supplies the ingredient text; every judgement about it is
 * made offline by lib/halal. Adl never reports a product as halal — see
 * HALAL_DISCLAIMER. Works from cache with no signal, and by hand with no
 * camera.
 */
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SlidersHorizontal, X } from 'lucide-react-native';
import AppText from '../components/ui/AppText';
import ScannerView from '../components/halal/ScannerView';
import ScanResult from '../components/halal/ScanResult';
import ScanHistory from '../components/halal/ScanHistory';
import ManualEntry from '../components/halal/ManualEntry';
import AdditiveLibrary from '../components/halal/AdditiveLibrary';
import AdditiveSheet from '../components/halal/AdditiveSheet';
import StandardSheet from '../components/halal/StandardSheet';
import LabelCapture from '../components/halal/LabelCapture';
import useHalalScanner from '../hooks/useHalalScanner';
import useAISettings from '../hooks/useAISettings';
import { haptics } from '../lib/haptics';
import { assessIngredients } from '../lib/halal/assess';
import { transcribeLabel, providerSupportsVision } from '../lib/halal/ocr';
import { lookupBarcode, type LookupResult, type Product } from '../lib/halal/openFoodFacts';
import type { BarcodeKind } from '../lib/halal/barcode';
import { HALAL_INTRO, HALAL_SCOPE, type Additive } from '../content/halal';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

type Tab = 'scan' | 'library' | 'history';

export default function HalalScannerScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const scanner = useHalalScanner();
  const ai = useAISettings();

  const [tab, setTab] = useState<Tab>('scan');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [pasted, setPasted] = useState('');
  const [detail, setDetail] = useState<Additive | null>(null);
  const [standardOpen, setStandardOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [reading, setReading] = useState(false);
  const [ocrNote, setOcrNote] = useState<string | null>(null);

  const canReadLabel = ai.keyPresent && providerSupportsVision(ai.providerId);

  const product: Product | null =
    result && (result.status === 'found' || result.status === 'no-ingredients') ? result.product : null;

  const assessment = useMemo(() => {
    if (result?.status === 'found') return assessIngredients(result.product.ingredientsText, scanner.prefs);
    if (pasted.trim()) return assessIngredients(pasted, scanner.prefs);
    return null;
  }, [result, pasted, scanner.prefs]);

  const run = useCallback(
    async (code: string, kind?: BarcodeKind) => {
      setBusy(true);
      setPasted('');
      const res = await lookupBarcode(code, { kind });
      setResult(res);
      setBusy(false);
      if (res.status === 'found') {
        const a = assessIngredients(res.product.ingredientsText, scanner.prefs);
        scanner.remember({
          barcode: res.product.barcode,
          name: res.product.name,
          brand: res.product.brand,
          verdict: a.verdict,
          flagCount: a.flags.filter((f) => f.level !== 'note').length,
          scannedAt: Date.now(),
        });
      }
    },
    [scanner],
  );

  const readLabel = useCallback(
    async (base64Jpeg: string) => {
      setReading(true);
      setOcrNote(null);
      const key = await ai.readKey();
      if (!key) {
        setReading(false);
        setCaptureOpen(false);
        setOcrNote('No API key is saved. Add one in AI settings first.');
        return;
      }
      const res = await transcribeLabel({
        providerId: ai.providerId,
        model: ai.model,
        key,
        base64Jpeg,
      });
      setReading(false);
      setCaptureOpen(false);
      if (res.status === 'ok') {
        setResult(null);
        setPasted(res.text);
        setOcrNote('Check this against the packet and correct anything wrong before relying on it.');
        haptics.success();
      } else {
        haptics.warning();
        setOcrNote(
          res.status === 'unreadable'
            ? 'The label could not be read. Try again with more light, or type it in.'
            : res.status === 'no-vision-model'
              ? 'The provider you have chosen has no model that can read images.'
              : res.message,
        );
      }
    },
    [ai],
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <AppText style={styles.headerTitle}>Ingredients</AppText>
          <AppText style={styles.headerSub} numberOfLines={1}>
            {scanner.relaxedCount > 0 ? `${scanner.relaxedCount} of 3 positions eased` : 'Cautious settings'}
          </AppText>
        </View>
        <Pressable
          onPress={() => setStandardOpen(true)}
          hitSlop={12}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Your standard"
        >
          <SlidersHorizontal size={19} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {(['scan', 'library', 'history'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              haptics.selection();
              setTab(t);
            }}
            style={[styles.tab, tab === t && styles.tabOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
          >
            <AppText style={[styles.tabText, tab === t && styles.tabTextOn]}>
              {t === 'scan' ? 'Scan' : t === 'library' ? 'Additives' : 'History'}
            </AppText>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {tab === 'scan' ? (
          <>
            <ScannerView active={tab === 'scan' && !busy && !captureOpen} onScan={run} onManual={() => setOcrNote(null)} />

            <ManualEntry
              pasted={pasted}
              onPastedChange={(t) => {
                setPasted(t);
                setResult(null);
              }}
              onLookup={(code) => void run(code)}
              canReadLabel={canReadLabel}
              onCapture={() => {
                setOcrNote(null);
                setCaptureOpen(true);
              }}
              note={ocrNote}
            />

            {busy ? (
              <View style={styles.busy}>
                <ActivityIndicator color={colors.primary} />
                <AppText style={styles.busyText}>Looking it up…</AppText>
              </View>
            ) : null}

            {!busy && result && result.status !== 'found' ? (
              <View style={styles.problem}>
                <AppText style={styles.problemTitle}>
                  {result.status === 'not-found'
                    ? 'Not in Open Food Facts'
                    : result.status === 'no-ingredients'
                      ? 'No ingredients listed'
                      : result.status === 'invalid-barcode'
                        ? "That barcode didn't check out"
                        : 'Lookup failed'}
                </AppText>
                <AppText style={styles.problemBody}>
                  {result.status === 'not-found'
                    ? 'Nobody has added this product yet. Paste the ingredients from the packet and Adl will read them.'
                    : result.status === 'no-ingredients'
                      ? `The record for ${result.product.name} has no ingredient list. Paste it from the packet instead.`
                      : result.status === 'invalid-barcode'
                        ? 'The check digit did not match, so the number was misread. Try again.'
                        : result.message}
                </AppText>
              </View>
            ) : null}

            {!busy && assessment && product ? (
              <ScanResult
                product={product}
                assessment={assessment}
                fromCache={result?.status === 'found' ? result.fromCache : false}
                onOpenFlag={(f) => setDetail(f.additive)}
              />
            ) : null}

            {!busy && assessment && !product ? (
              <ScanResult
                product={{
                  barcode: '—',
                  name: 'Pasted ingredients',
                  brand: '',
                  quantity: '',
                  ingredientsText: pasted,
                  imageUrl: '',
                  fetchedAt: Date.now(),
                }}
                assessment={assessment}
                fromCache={false}
                onOpenFlag={(f) => setDetail(f.additive)}
              />
            ) : null}

            {!result && !pasted ? (
              <View style={styles.about}>
                <AppText style={styles.aboutText}>{HALAL_INTRO}</AppText>
                {HALAL_SCOPE.map((s) => (
                  <View key={s} style={styles.bulletRow}>
                    <AppText style={styles.bullet}>•</AppText>
                    <AppText style={styles.aboutSmall}>{s}</AppText>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : tab === 'library' ? (
          <AdditiveLibrary onSelect={setDetail} />
        ) : (
          <ScanHistory
            history={scanner.history}
            onSelect={(barcode) => {
              setTab('scan');
              void run(barcode);
            }}
            onClear={scanner.clearHistory}
          />
        )}
      </ScrollView>

      <AdditiveSheet additive={detail} onClose={() => setDetail(null)} />
      <LabelCapture
        visible={captureOpen}
        providerLabel={ai.provider.label}
        busy={reading}
        onCapture={(b64) => void readLabel(b64)}
        onClose={() => setCaptureOpen(false)}
      />
      <StandardSheet
        visible={standardOpen}
        prefs={scanner.prefs}
        onSet={scanner.setStance}
        onClose={() => setStandardOpen(false)}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing['3xl'] + spacing.md,
      paddingBottom: spacing.md,
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerCenter: { flex: 1, alignItems: 'center', gap: 1 },
    headerTitle: { fontFamily, fontSize: 16, fontWeight: '700', color: colors.foreground },
    headerSub: { fontFamily, fontSize: 11, color: colors.subtleForeground },
    tabs: {
      flexDirection: 'row',
      gap: spacing.xs,
      padding: 3,
      borderRadius: radius.md,
      backgroundColor: colors.cardElevated,
      marginBottom: spacing.md,
    },
    tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, borderRadius: radius.sm, minHeight: 40 },
    tabOn: { backgroundColor: colors.card },
    tabText: { ...typography.label, color: colors.mutedForeground },
    tabTextOn: { color: colors.foreground, fontWeight: '700' },
    scroll: { paddingBottom: spacing['3xl'], gap: spacing.md },
    busy: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
    busyText: { fontFamily, fontSize: 13, color: colors.mutedForeground },
    problem: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.xs,
    },
    problemTitle: { ...typography.title, fontSize: 15, color: colors.foreground },
    problemBody: { fontFamily, fontSize: 13, lineHeight: 20, color: colors.mutedForeground },
    about: { gap: spacing.sm, paddingTop: spacing.xs },
    aboutText: { fontFamily, fontSize: 13, lineHeight: 21, color: colors.mutedForeground },
    aboutSmall: { flex: 1, fontFamily, fontSize: 12, lineHeight: 19, color: colors.subtleForeground },
    bulletRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    bullet: { fontFamily, fontSize: 14, color: colors.primary, lineHeight: 19 },
  });
