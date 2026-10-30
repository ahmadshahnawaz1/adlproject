import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Home, Settings, LogOut, Compass, Sparkles, CalendarDays, Flame, Droplets, Coins, HandCoins, Moon, MoonStar, BookOpen, BookOpenText, BookMarked, Target, GraduationCap } from 'lucide-react-native';
import { Mosque } from 'phosphor-react-native';
import BrandMark from './BrandMark';
import KaabaGlyph from './KaabaGlyph';
import TasbihGlyph from './TasbihGlyph';
import MihrabGlyph from './MihrabGlyph';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(Math.round(width * 0.78), 320);
const OPEN = 320; // confident, cinematic glide in
const CLOSE = 240; // graceful glide out

type Item = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

const makeItems = (colors: ThemeColors): Item[] => [
  {
    key: 'home',
    label: 'Home',
    icon: <Home size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'quran',
    label: 'Qurʾān',
    icon: <BookMarked size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'prayer',
    label: 'Prayer',
    icon: <Mosque size={20} color={colors.mutedForeground} weight="regular" />,
  },
  {
    key: 'tracker',
    label: 'Tracker',
    icon: <Flame size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'salah',
    label: 'How to Pray',
    icon: <MihrabGlyph size={20} color={colors.mutedForeground} accent={colors.mutedForeground} />,
  },
  {
    key: 'wudu',
    label: 'Wudū guide',
    icon: <Droplets size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'adhkar',
    label: 'Adhkār',
    icon: <BookOpenText size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'duas',
    label: 'Duʿāʾ',
    icon: <BookOpen size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'zakat',
    label: 'Zakat',
    icon: <Coins size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'sadaqah',
    label: 'Ṣadaqah',
    icon: <HandCoins size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'fasting',
    label: 'Fasting',
    icon: <Moon size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'pilgrimage',
    label: 'Ḥajj & ʿUmrah',
    icon: <KaabaGlyph size={20} color={colors.mutedForeground} accent={colors.mutedForeground} />,
  },
  {
    key: 'tasbih',
    label: 'Tasbīḥ',
    icon: <TasbihGlyph size={20} color={colors.mutedForeground} accent={colors.mutedForeground} />,
  },
  {
    key: 'dhikr',
    label: 'Dhikr Goals',
    icon: <Target size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'learn',
    label: 'Learn',
    icon: <GraduationCap size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'qibla',
    label: 'Qibla',
    icon: <Compass size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'sunnah',
    label: 'Sunnah',
    icon: <Sparkles size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'tahajjud',
    label: 'Tahajjud',
    icon: <MoonStar size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'calendar',
    label: 'Calendar',
    icon: <CalendarDays size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
];

/**
 * Sidebar — a shadcn/ui-inspired navigation drawer. Glides in from the left
 * over a soft backdrop, with the always-glowing عدل + crescent centered at the
 * top. Exceptionally smooth open/close, matching the app's transition language.
 */
export default function Sidebar({
  open,
  onClose,
  onNavigate,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate?: (key: string) => void;
  onSignOut?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const items = makeItems(colors);
  const [mounted, setMounted] = React.useState(open);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: OPEN,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: CLOSE,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [open, progress]);

  if (!mounted) return null;

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-PANEL_WIDTH, 0],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[styles.panel, { width: PANEL_WIDTH, transform: [{ translateX }] }]}
      >
        <Pressable
          style={styles.brand}
          onPress={() => {
            onClose();
            onNavigate?.('home');
          }}
          accessibilityRole="button"
          accessibilityLabel="Go to home"
        >
          <BrandMark size={40} layout="stack" />
        </Pressable>

        <View style={styles.nav}>
          {items.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => {
                onClose();
                onNavigate?.(item.key);
              }}
            >
              {item.icon}
              <Text style={styles.itemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={onClose}
          >
            <Settings size={20} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={styles.itemLabel}>Settings</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={onSignOut}
          >
            <LogOut size={20} color={colors.destructive} strokeWidth={2} />
            <Text style={[styles.itemLabel, styles.signOut]}>Sign out</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: spacing['3xl'] + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  brand: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nav: { flex: 1, gap: spacing.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  itemPressed: { backgroundColor: colors.cardElevated },
  itemLabel: { ...typography.button, color: colors.foreground },
  footer: {
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signOut: { color: colors.destructive },
});
