import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LocateFixed, Check, X } from 'lucide-react-native';
import { CITIES, type City, type ResolvedLocation } from '../lib/location';
import { radius, spacing, typography } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

/**
 * CityPicker — a calm bottom sheet to override location.
 *
 * "Use my location" re-requests high-accuracy GPS; the curated city list lets
 * travellers (or anyone who denied GPS) pin a place manually. The currently
 * active place is marked with a check.
 */
export default function CityPicker({
  visible,
  current,
  refreshing,
  onClose,
  onUseGps,
  onPickCity,
}: {
  visible: boolean;
  current: ResolvedLocation;
  refreshing: boolean;
  onClose: () => void;
  onUseGps: () => void;
  onPickCity: (city: City) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const activeCityName =
    current.source === 'manual' ? current.label.split(',')[0].trim() : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Location</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        </View>

        <Pressable
          onPress={onUseGps}
          style={({ pressed }) => [styles.gpsRow, pressed && styles.pressed]}
        >
          <View style={styles.gpsLeft}>
            <LocateFixed size={20} color={colors.primary} strokeWidth={2.25} />
            <View>
              <Text style={styles.gpsLabel}>Use my location</Text>
              <Text style={styles.gpsHint}>
                {refreshing ? 'Locating…' : 'High-accuracy GPS'}
              </Text>
            </View>
          </View>
          {current.source === 'gps' || current.source === 'cache' ? (
            <Check size={18} color={colors.primary} strokeWidth={2.5} />
          ) : null}
        </Pressable>

        <Text style={styles.sectionLabel}>Or choose a city</Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {CITIES.map((city) => {
            const active = activeCityName === city.name;
            return (
              <Pressable
                key={`${city.name}-${city.country}`}
                onPress={() => onPickCity(city)}
                style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}
              >
                <View>
                  <Text style={styles.cityName}>{city.name}</Text>
                  <Text style={styles.cityCountry}>{city.country}</Text>
                </View>
                {active ? (
                  <Check size={18} color={colors.primary} strokeWidth={2.5} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '82%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: { ...typography.title, color: colors.foreground },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  gpsLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  gpsLabel: { ...typography.button, color: colors.foreground },
  gpsHint: { ...typography.caption, color: colors.mutedForeground, marginTop: 1 },
  sectionLabel: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  list: { flexGrow: 0 },
  listContent: { gap: spacing.xs },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  cityName: { ...typography.button, color: colors.foreground },
  cityCountry: { ...typography.caption, color: colors.subtleForeground, marginTop: 1 },
  pressed: { opacity: 0.6 },
});
