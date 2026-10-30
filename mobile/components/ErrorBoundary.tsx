/**
 * ErrorBoundary — catches render/lifecycle exceptions so a single failing screen
 * degrades to a recoverable message instead of a white screen. Class component
 * (required for componentDidCatch); the visible fallback is themed.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from './ui/AppText';
import { RefreshCw, TriangleAlert } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';

type Props = { children: React.ReactNode; label?: string; onReset?: () => void };
type State = { error: Error | null };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    if (__DEV__) console.warn(`[ErrorBoundary${this.props.label ? ` · ${this.props.label}` : ''}]`, error?.message);
  }

  reset = (): void => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} label={this.props.label} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, label, onReset }: { error: Error; label?: string; onReset: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <TriangleAlert size={28} color={colors.primary} strokeWidth={2} />
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.body}>
        {label ? `The ${label} screen ran into a problem.` : 'This screen ran into a problem.'} Your data is safe.
      </Text>
      {__DEV__ ? (
        <ScrollView style={styles.devBox} contentContainerStyle={styles.devContent}>
          <Text style={styles.devText}>{error?.message}</Text>
        </ScrollView>
      ) : null}
      <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={onReset} accessibilityRole="button" accessibilityLabel="Try again">
        <RefreshCw size={16} color={colors.primaryForeground} strokeWidth={2.4} />
        <Text style={styles.btnText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
    icon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.primary}1A` },
    title: { ...typography.title, fontSize: 20, color: colors.foreground, textAlign: 'center' },
    body: { fontFamily, fontSize: 15, lineHeight: 22, color: colors.mutedForeground, textAlign: 'center', maxWidth: 320 },
    devBox: { maxHeight: 140, alignSelf: 'stretch', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
    devContent: { padding: spacing.md },
    devText: { fontFamily, fontSize: 12, color: colors.destructive },
    btn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.sm },
    btnText: { ...typography.button, color: colors.primaryForeground },
    pressed: { opacity: 0.85 },
  });
