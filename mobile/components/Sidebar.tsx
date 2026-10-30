import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Home, LogOut, Compass, Sparkles, CalendarDays, Flame, Droplets, Coins, HandCoins, Moon, MoonStar, BookOpen, BookOpenText, BookText, BookMarked, Target, GraduationCap, SunMoon, Languages, MapPinned, Bot, Footprints, GripVertical, Pin, PinOff, ArrowUpDown, Check, Gem, Settings, Brain, Plane, Scale, ScanLine } from 'lucide-react-native';
import { Mosque } from 'phosphor-react-native';
import BrandMark from './BrandMark';
import KaabaGlyph from './KaabaGlyph';
import TasbihGlyph from './TasbihGlyph';
import MihrabGlyph from './MihrabGlyph';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { useT } from '../i18n/LocaleContext';
import type { MessageKey } from '../i18n';
import ReorderableList from './common/ReorderableList';
import useNavOrder from '../hooks/useNavOrder';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './settings/primitives';

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
    key: 'ai',
    label: 'ADL AI',
    icon: <Bot size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'quran',
    label: 'Qurʾān',
    icon: <BookMarked size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'hifz',
    label: 'Ḥifẓ',
    icon: <Brain size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'hadith',
    label: 'Hadith',
    icon: <BookText size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'sirah',
    label: 'Sīrah',
    icon: <Footprints size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'names',
    label: 'The 99 Names',
    icon: <Gem size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'travel',
    label: 'Travel',
    icon: <Plane size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'jumuah',
    label: 'Jumuʿah & Eid',
    icon: <CalendarDays size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'faraid',
    label: 'Inheritance',
    icon: <Scale size={20} color={colors.mutedForeground} strokeWidth={2} />,
  },
  {
    key: 'halal',
    label: 'Ingredients',
    icon: <ScanLine size={20} color={colors.mutedForeground} strokeWidth={2} />,
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
    key: 'ramadan',
    label: 'Ramaḍān',
    icon: <MoonStar size={20} color={colors.mutedForeground} strokeWidth={2} />,
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
    key: 'mosques',
    label: 'Mosques & Halal',
    icon: <MapPinned size={20} color={colors.mutedForeground} strokeWidth={2} />,
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
  const t = useT();
  const { user } = useAuth();
  const items = makeItems(colors);
  const homeItem = items[0];
  const itemByKey = useMemo(() => {
    const m = new Map<string, Item>();
    for (const it of items) m.set(it.key, it);
    return m;
  }, [items]);
  const defaultKeys = useMemo(() => items.slice(1).map((i) => i.key), [items]);
  const nav = useNavOrder(defaultKeys);
  const orderedItems = useMemo(
    () => nav.orderedKeys.map((k) => itemByKey.get(k)).filter((i): i is Item => Boolean(i)),
    [nav.orderedKeys, itemByKey],
  );
  const [editing, setEditing] = useState(false);
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
      setEditing(false);
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
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close menu" />
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
          accessibilityLabel={t('nav.goHome')}
        >
          <BrandMark size={40} layout="stack" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.profile, pressed && styles.itemPressed]}
          onPress={() => { onClose(); onNavigate?.('settings'); }}
          accessibilityRole="button"
          accessibilityLabel={`${user?.name ?? 'Guest'}, manage account`}
        >
          <Avatar name={user?.name ?? 'Guest'} color={user?.avatarColor ?? colors.primary} size={40} />
          <View style={styles.profileText}>
            <Text style={styles.profileName} numberOfLines={1}>{user?.name ?? 'Guest'}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{user?.email ?? 'Tap to manage account'}</Text>
          </View>
          <Settings size={18} color={colors.subtleForeground} strokeWidth={2} />
        </Pressable>

        <View style={styles.nav}>
          {/* Home stays fixed at the top */}
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => { onClose(); onNavigate?.('home'); }}
            accessibilityRole="button"
            accessibilityLabel={t('nav.home' as MessageKey)}
          >
            {homeItem.icon}
            <Text style={styles.itemLabel}>{t('nav.home' as MessageKey)}</Text>
          </Pressable>

          <Pressable
            style={styles.editToggle}
            onPress={() => setEditing((e) => !e)}
            accessibilityRole="button"
            accessibilityLabel={editing ? 'Done editing menu' : 'Edit menu order'}
          >
            {editing ? (
              <Check size={15} color={colors.primary} strokeWidth={2.5} />
            ) : (
              <ArrowUpDown size={15} color={colors.subtleForeground} strokeWidth={2} />
            )}
            <Text style={[styles.editToggleText, editing && { color: colors.primary }]}>
              {editing ? 'Done' : 'Edit menu'}
            </Text>
          </Pressable>

          {editing ? (
            <ReorderableList
              data={orderedItems}
              keyExtractor={(i) => i.key}
              itemHeight={46}
              gap={spacing.xs}
              style={styles.reorder}
              onReorder={(next) => nav.reorder(next.map((i) => i.key))}
              renderItem={({ item, isActive, dragHandleProps }) => (
                <View style={[styles.editRow, isActive && styles.editRowActive]}>
                  <View {...dragHandleProps} style={styles.grip}>
                    <GripVertical size={18} color={colors.subtleForeground} strokeWidth={2} />
                  </View>
                  {item.icon}
                  <Text style={styles.editLabel} numberOfLines={1}>{t(`nav.${item.key}` as MessageKey)}</Text>
                  <Pressable
                    onPress={() => nav.toggle(item.key)}
                    hitSlop={8}
                    style={styles.pinBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`${nav.pinned.has(item.key) ? 'Unpin' : 'Pin'} ${t(`nav.${item.key}` as MessageKey)}`}
                    accessibilityState={{ selected: nav.pinned.has(item.key) }}
                  >
                    {nav.pinned.has(item.key) ? (
                      <Pin size={16} color={colors.primary} strokeWidth={2.2} />
                    ) : (
                      <PinOff size={16} color={colors.subtleForeground} strokeWidth={2} />
                    )}
                  </Pressable>
                </View>
              )}
            />
          ) : (
            <ScrollView
              style={styles.nav}
              contentContainerStyle={styles.navContent}
              showsVerticalScrollIndicator={false}
            >
              {orderedItems.map((item) => (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                  onPress={() => {
                    onClose();
                    onNavigate?.(item.key);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t(`nav.${item.key}` as MessageKey)}
                >
                  {item.icon}
                  <Text style={styles.itemLabel}>{t(`nav.${item.key}` as MessageKey)}</Text>
                  {nav.pinned.has(item.key) ? (
                    <Pin size={13} color={colors.primary} strokeWidth={2.2} style={styles.pinnedDot} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => {
              onClose();
              onNavigate?.('settings');
            }}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Settings size={20} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={styles.itemLabel}>Settings</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => {
              onClose();
              onNavigate?.('appearance');
            }}
            accessibilityRole="button"
            accessibilityLabel={t('nav.appearance')}
          >
            <SunMoon size={20} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={styles.itemLabel}>{t('nav.appearance')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => {
              onClose();
              onNavigate?.('language');
            }}
            accessibilityRole="button"
            accessibilityLabel={t('language.title')}
          >
            <Languages size={20} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={styles.itemLabel}>{t('language.title')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={onSignOut}
            accessibilityRole="button"
            accessibilityLabel={t('nav.signOut')}
          >
            <LogOut size={20} color={colors.destructive} strokeWidth={2} />
            <Text style={[styles.itemLabel, styles.signOut]}>{t('nav.signOut')}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
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
  nav: { flex: 1 },
  navContent: { gap: spacing.xs, paddingBottom: spacing.sm },
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
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, marginBottom: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardElevated },
  profileText: { flex: 1, minWidth: 0 },
  profileName: { fontFamily, fontSize: 15, fontWeight: '700', color: colors.foreground },
  profileEmail: { fontFamily, fontSize: 12, color: colors.subtleForeground },
  pinnedDot: { marginLeft: 'auto' },
  editToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm, marginBottom: spacing.xs },
  editToggleText: { ...typography.caption, fontSize: 12, fontWeight: '700', color: colors.subtleForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
  reorder: { flex: 1 },
  editRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 46, paddingLeft: 2, paddingRight: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  editRowActive: { borderColor: `${colors.primary}66`, backgroundColor: colors.cardElevated },
  grip: { paddingHorizontal: 4, height: '100%', justifyContent: 'center' },
  editLabel: { ...typography.button, color: colors.foreground, flex: 1 },
  pinBtn: { padding: 4 },
  footer: {
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signOut: { color: colors.destructive },
});
