/**
 * DhikrGoalsSheet — a bottom sheet to tune the daily remembrance goals: whether
 * the morning and evening adhkār count, and the daily tasbīḥ target (a stepper
 * in steps of 33; zero turns the goal off). Driven by the config + onChange
 * passed in from the hub.
 */
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';
import {
  clampTasbihTarget,
  MAX_TASBIH_TARGET,
  MIN_TASBIH_TARGET,
  TASBIH_TARGET_STEP,
  type DhikrGoalConfig,
} from '../../lib/dhikrGoals';
import { fontFamily, radius, spacing } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

export default function DhikrGoalsSheet({
  visible,
  onClose,
  config,
  onChange,
}: {
  visible: boolean;
  onClose: () => void;
  config: DhikrGoalConfig;
  onChange: (patch: Partial<DhikrGoalConfig>) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const atMin = config.tasbihTarget <= MIN_TASBIH_TARGET;
  const atMax = config.tasbihTarget >= MAX_TASBIH_TARGET;

  const stepTarget = (dir: -1 | 1) => {
    onChange({
      tasbihTarget: clampTasbihTarget(
        config.tasbihTarget + dir * TASBIH_TARGET_STEP,
      ),
    });
  };

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
            <Text style={styles.title}>Daily goals</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={styles.section}>ADHKĀR</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleLabel}>Morning adhkār</Text>
              <Text style={styles.toggleHint}>Count the morning remembrances</Text>
            </View>
            <Switch
              value={config.morningAdhkar}
              onValueChange={(v) => onChange({ morningAdhkar: v })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.border}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleLabel}>Evening adhkār</Text>
              <Text style={styles.toggleHint}>Count the evening remembrances</Text>
            </View>
            <Switch
              value={config.eveningAdhkar}
              onValueChange={(v) => onChange({ eveningAdhkar: v })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.border}
            />
          </View>

          <Text style={styles.section}>TASBĪḤ TARGET</Text>
          <View style={styles.sizeRow}>
            <Pressable
              onPress={() => stepTarget(-1)}
              disabled={atMin}
              style={[styles.stepBtn, atMin && styles.stepDisabled]}
            >
              <Minus size={18} color={colors.foreground} />
            </Pressable>
            <Text style={styles.sizeValue}>
              {config.tasbihTarget === 0 ? 'Off' : `${config.tasbihTarget}`}
            </Text>
            <Pressable
              onPress={() => stepTarget(1)}
              disabled={atMax}
              style={[styles.stepBtn, atMax && styles.stepDisabled]}
            >
              <Plus size={18} color={colors.foreground} />
            </Pressable>
          </View>
          <Text style={styles.note}>
            A daily count of remembrances on the beads. Set to Off to skip this
            goal.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
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
  section: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.subtleForeground,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontFamily, fontSize: 15, color: colors.foreground },
  toggleHint: { fontFamily, fontSize: 12.5, color: colors.subtleForeground },
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
    fontVariant: ['tabular-nums'],
  },
  note: {
    fontFamily,
    fontSize: 12.5,
    color: colors.subtleForeground,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
