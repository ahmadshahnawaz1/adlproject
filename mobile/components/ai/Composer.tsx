/**
 * Composer — the ADL AI input bar: a growing multiline field with a send button
 * that becomes a stop button while a reply streams (F19).
 */
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Send, Square } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';

export default function Composer({
  value,
  onChangeText,
  onSend,
  onStop,
  streaming,
  placeholder = 'Ask about the Qurʾān, Sunnah, or Islam…',
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  onStop: () => void;
  streaming: boolean;
  placeholder?: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [height, setHeight] = useState(0);
  const canSend = value.trim().length > 0;

  return (
    <View style={styles.wrap}>
      <TextInput
        style={[styles.input, { height: Math.min(140, Math.max(24, height)) }]}
        value={value}
        onChangeText={onChangeText}
        onContentSizeChange={(e) => setHeight(e.nativeEvent.contentSize.height)}
        placeholder={placeholder}
        placeholderTextColor={colors.subtleForeground}
        multiline
        textAlignVertical="top"
        editable={!streaming}
      />
      {streaming ? (
        <Pressable onPress={onStop} style={styles.stopBtn} accessibilityRole="button" accessibilityLabel="Stop generating">
          <Square size={16} color={colors.primaryForeground} strokeWidth={2.6} fill={colors.primaryForeground} />
        </Pressable>
      ) : (
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={[styles.sendBtn, !canSend && styles.sendDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send"
        >
          <Send size={16} color={colors.primaryForeground} strokeWidth={2.4} />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    input: {
      flex: 1,
      fontFamily,
      fontSize: typography.body.fontSize,
      lineHeight: 21,
      color: colors.foreground,
      paddingVertical: 4,
    },
    sendBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendDisabled: { opacity: 0.4 },
    stopBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.destructive,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
