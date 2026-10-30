/**
 * ManualEntry — the paths that work when the camera or the database cannot
 * help: type a barcode, paste the ingredients, or photograph the label.
 *
 * The pasted field is deliberately the destination for a transcription, so
 * anything a vision model reads lands somewhere the user can correct it.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ScanText } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function ManualEntry({
  pasted,
  onPastedChange,
  onLookup,
  canReadLabel,
  onCapture,
  note,
}: {
  pasted: string;
  onPastedChange: (text: string) => void;
  onLookup: (barcode: string) => void;
  canReadLabel: boolean;
  onCapture: () => void;
  note?: string | null;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [barcode, setBarcode] = useState('');
  const ready = barcode.trim().length >= 8;

  return (
    <View style={styles.card}>
      <AppText style={styles.cardTitle}>Or enter it yourself</AppText>

      <View style={styles.row}>
        <TextInput
          value={barcode}
          onChangeText={(t) => setBarcode(t.replace(/[^0-9]/g, ''))}
          placeholder="Barcode number"
          placeholderTextColor={colors.subtleForeground}
          keyboardType="number-pad"
          style={styles.input}
          accessibilityLabel="Barcode number"
        />
        <Pressable
          onPress={() => onLookup(barcode.trim())}
          disabled={!ready}
          style={[styles.goBtn, !ready && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel="Look up barcode"
        >
          <AppText style={styles.goText}>Look up</AppText>
        </Pressable>
      </View>

      <TextInput
        value={pasted}
        onChangeText={onPastedChange}
        placeholder="…or paste the ingredients list from the packet"
        placeholderTextColor={colors.subtleForeground}
        multiline
        style={[styles.input, styles.textarea]}
        accessibilityLabel="Paste an ingredients list"
      />

      {canReadLabel ? (
        <Pressable
          onPress={onCapture}
          style={styles.ocrBtn}
          accessibilityRole="button"
          accessibilityLabel="Photograph the label to read it"
        >
          <ScanText size={15} color={colors.primary} strokeWidth={2.25} />
          <AppText style={styles.ocrText}>Photograph the label instead</AppText>
        </Pressable>
      ) : null}

      {note ? <AppText style={styles.note}>{note}</AppText> : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    cardTitle: { ...typography.title, fontSize: 15, color: colors.foreground },
    row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
    input: {
      flex: 1,
      fontFamily,
      fontSize: 14,
      color: colors.foreground,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 44,
    },
    textarea: { minHeight: 76, textAlignVertical: 'top' },
    goBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.sm,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: { opacity: 0.4 },
    goText: { ...typography.button, fontSize: 14, color: colors.primaryForeground },
    ocrBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: `${colors.primary}55`,
      minHeight: 44,
    },
    ocrText: { ...typography.button, fontSize: 13, color: colors.primary },
    note: { ...typography.caption, fontSize: 11, lineHeight: 18, color: colors.subtleForeground },
  });
