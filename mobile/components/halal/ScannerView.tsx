/**
 * ScannerView — the camera, and every state it can be in before it works.
 *
 * The check digit is validated on device before a lookup is attempted, so a
 * misread never fetches a different product's ingredients.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, CameraOff, Keyboard } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { haptics } from '../../lib/haptics';
import { normalizeBarcode, type BarcodeKind } from '../../lib/halal/barcode';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

const TYPES: BarcodeKind[] = ['ean13', 'ean8', 'upc_a', 'upc_e'];
/** Ignore repeat reads of the same code for this long. */
const RESCAN_MS = 2500;

export default function ScannerView({
  active,
  onScan,
  onManual,
}: {
  active: boolean;
  onScan: (barcode: string, kind?: BarcodeKind) => void;
  onManual: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [permission, requestPermission] = useCameraPermissions();
  const [rejected, setRejected] = useState(false);
  const lastRef = useRef<{ code: string; at: number } | null>(null);

  useEffect(() => {
    if (!rejected) return;
    const t = setTimeout(() => setRejected(false), 1800);
    return () => clearTimeout(t);
  }, [rejected]);

  const handle = useCallback(
    ({ data, type }: { data: string; type: string }) => {
      const now = Date.now();
      const last = lastRef.current;
      if (last && last.code === data && now - last.at < RESCAN_MS) return;
      lastRef.current = { code: data, at: now };

      const kind = TYPES.includes(type as BarcodeKind) ? (type as BarcodeKind) : undefined;
      if (!normalizeBarcode(data, kind)) {
        haptics.warning();
        setRejected(true);
        return;
      }
      haptics.success();
      onScan(data, kind);
    },
    [onScan],
  );

  if (!permission) {
    return <View style={styles.frame} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.frame, styles.center]}>
        <CameraOff size={30} color={colors.subtleForeground} strokeWidth={1.75} />
        <AppText style={styles.stateTitle}>
          {permission.canAskAgain ? 'Camera access needed' : 'Camera access is off'}
        </AppText>
        <AppText style={styles.stateBody}>
          {permission.canAskAgain
            ? 'Adl uses the camera only to read a barcode. Nothing is recorded or sent anywhere.'
            : 'Turn the camera on for Adl in your device settings, or type the barcode instead.'}
        </AppText>
        <View style={styles.actions}>
          {permission.canAskAgain ? (
            <Pressable
              onPress={() => void requestPermission()}
              style={styles.primaryBtn}
              accessibilityRole="button"
              accessibilityLabel="Allow camera access"
            >
              <Camera size={16} color={colors.primaryForeground} strokeWidth={2.25} />
              <AppText style={styles.primaryText}>Allow camera</AppText>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onManual}
            style={styles.secondaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Enter a barcode by hand"
          >
            <Keyboard size={16} color={colors.mutedForeground} strokeWidth={2.25} />
            <AppText style={styles.secondaryText}>Type it instead</AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      {active ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: TYPES }}
          onBarcodeScanned={handle}
        />
      ) : null}
      <View style={styles.reticle} pointerEvents="none" />
      <View style={styles.hintWrap} pointerEvents="none">
        <AppText style={styles.hint}>
          {rejected ? "That barcode didn't read cleanly — try again" : 'Point at the barcode'}
        </AppText>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    frame: {
      height: 260,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.cardElevated,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
    },
    center: { alignItems: 'center', gap: spacing.xs, padding: spacing.lg },
    stateTitle: { ...typography.title, fontSize: 16, color: colors.foreground, marginTop: spacing.xs },
    stateBody: {
      fontFamily,
      fontSize: 13,
      lineHeight: 20,
      color: colors.mutedForeground,
      textAlign: 'center',
      maxWidth: 280,
    },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap', justifyContent: 'center' },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      minHeight: 44,
    },
    primaryText: { ...typography.button, fontSize: 14, color: colors.primaryForeground },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      minHeight: 44,
    },
    secondaryText: { ...typography.button, fontSize: 14, color: colors.mutedForeground },
    reticle: {
      alignSelf: 'center',
      width: '76%',
      height: 116,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.85)',
    },
    hintWrap: { position: 'absolute', left: 0, right: 0, bottom: spacing.md, alignItems: 'center' },
    hint: {
      ...typography.caption,
      fontSize: 11,
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
  });
