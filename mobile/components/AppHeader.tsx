import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { PanelLeft } from 'lucide-react-native';
import BrandMark from './BrandMark';
import { spacing } from '../theme/tokens';
import { useTheme } from '../theme/ThemeContext';

/**
 * AppHeader — the persistent top bar shared by every screen inside the
 * dashboard shell. The menu toggle sits on the left and the always-glowing
 * عدل + crescent is centered, so the brand is present on every page, no matter
 * how many screens we add to the sidebar.
 */
export default function AppHeader({ onMenu }: { onMenu?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onMenu}
        hitSlop={16}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuPressed]}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <PanelLeft size={24} color={colors.foreground} strokeWidth={2.25} />
      </Pressable>

      <View style={styles.brand} pointerEvents="none">
        <BrandMark size={34} layout="row" />
      </View>

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing['3xl'] + spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
    borderRadius: 999,
  },
  menuPressed: { opacity: 0.6 },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { width: 44 },
});
