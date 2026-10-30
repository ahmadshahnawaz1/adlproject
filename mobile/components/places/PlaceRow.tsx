/**
 * PlaceRow — one nearby place: its name, a kind chip (mosque or halal), the
 * distance, an address if known, and a Directions button that opens the device
 * maps app. Theme-aware.
 */
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Landmark, Navigation, Utensils } from 'lucide-react-native';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';
import { formatDistance, type Place } from '../../lib/places';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';

function openDirections(place: Place): void {
  const { latitude, longitude } = place.coords;
  const label = encodeURIComponent(place.name);
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${label}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`).catch(() => {});
  });
}

export default function PlaceRow({ place }: { place: Place }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isMosque = place.kind === 'mosque';
  const Icon = isMosque ? Landmark : Utensils;
  const cuisine = place.tags?.cuisine?.replace(/[_;]/g, ' ');

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, !isMosque && styles.iconWrapHalal]}>
        <Icon size={18} color={isMosque ? colors.primary : colors.success} strokeWidth={2} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.chip, isMosque ? styles.chipMosque : styles.chipHalal]}>
            {isMosque ? 'Mosque' : 'Halal'}
          </Text>
          <Text style={styles.distance}>{formatDistance(place.distanceMeters)}</Text>
        </View>
        {place.address ? (
          <Text style={styles.address} numberOfLines={1}>
            {place.address}
          </Text>
        ) : cuisine ? (
          <Text style={styles.address} numberOfLines={1}>
            {cuisine}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={() => openDirections(place)}
        style={({ pressed }) => [styles.dirBtn, pressed && styles.pressed]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Directions to ${place.name}`}
      >
        <Navigation size={16} color={colors.primaryForeground} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    iconWrap: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapHalal: { backgroundColor: `${colors.success}1A` },
    body: { flex: 1, minWidth: 0, gap: 3 },
    name: { ...typography.button, fontSize: 15, color: colors.foreground },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    chip: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radius.sm,
      overflow: 'hidden',
    },
    chipMosque: { color: colors.primary, backgroundColor: `${colors.primary}1A` },
    chipHalal: { color: colors.success, backgroundColor: `${colors.success}1A` },
    distance: { fontFamily, fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
    address: { fontFamily, fontSize: 12, color: colors.subtleForeground },
    dirBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: { opacity: 0.85 },
  });
