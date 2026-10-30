/**
 * MosqueFinderScreen — find nearby mosques and halal food (F15).
 *
 * The app's one networked feature. It takes the device (or pinned) location,
 * searches OpenStreetMap's Overpass API, and lists mosques and halal venues
 * nearest-first, each with a Directions button into the maps app. It degrades
 * gracefully offline by showing the last cached results, and always carries the
 * required OpenStreetMap attribution.
 */
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import CityPicker from '../components/CityPicker';
import PlaceRow from '../components/places/PlaceRow';
import PlaceFilters from '../components/places/PlaceFilters';
import PlacesStatus, { OfflineBanner } from '../components/places/PlacesStatus';
import usePlacesFinder from '../hooks/usePlacesFinder';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { useT } from '../i18n/LocaleContext';
import { fontFamily, radius, spacing, typography } from '../theme/tokens';

export default function MosqueFinderScreen({ onClose }: { onClose?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const t = useT();
  const finder = usePlacesFinder();
  const [pickerOpen, setPickerOpen] = useState(false);

  const showList = finder.places.length > 0;
  const listHeader = useMemo(
    () => (finder.fromCache ? <OfflineBanner /> : null),
    [finder.fromCache],
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <X size={20} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('nav.mosques')}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {t('home.mosques.sub')}
          </Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      {/* Location row */}
      <Pressable
        onPress={() => setPickerOpen(true)}
        style={({ pressed }) => [styles.locRow, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Change location"
      >
        <MapPin size={16} color={colors.primary} strokeWidth={2.2} />
        <Text style={styles.locLabel} numberOfLines={1}>
          {finder.location.label}
        </Text>
        <Text style={styles.locChange}>Change</Text>
      </Pressable>

      {/* Filters */}
      <View style={styles.filters}>
        <PlaceFilters
          filter={finder.filter}
          onFilter={finder.setFilter}
          radiusMeters={finder.radiusMeters}
          onRadius={finder.setRadius}
        />
      </View>

      {/* Results */}
      {showList ? (
        <FlatList
          data={finder.places}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <PlaceRow place={item} />}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<Attribution />}
        />
      ) : (
        <View style={styles.statusWrap}>
          <PlacesStatus status={finder.status} onRetry={finder.search} />
          <Attribution />
        </View>
      )}

      <CityPicker
        visible={pickerOpen}
        current={finder.location}
        refreshing={finder.refreshing}
        onClose={() => setPickerOpen(false)}
        onUseGps={() => {
          finder.useGps();
          setPickerOpen(false);
        }}
        onPickCity={(city) => {
          finder.setCity(city);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}

function Attribution() {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.attribution}>
      <Text style={styles.attributionText}>Places data © OpenStreetMap contributors</Text>
      <Text style={styles.disclaimer}>
        Listings are community-sourced and may be incomplete. Please verify halal status
        independently before relying on it.
      </Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingTop: spacing['3xl'] + spacing.md,
      paddingBottom: spacing.md,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
    headerTitle: { fontFamily, fontSize: 17, fontWeight: '700', color: colors.foreground },
    headerSub: { fontFamily, fontSize: typography.caption.fontSize, color: colors.subtleForeground },

    locRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginBottom: spacing.md,
    },
    pressed: { opacity: 0.85 },
    locLabel: { flex: 1, minWidth: 0, fontFamily, fontSize: 14, fontWeight: '600', color: colors.foreground },
    locChange: { ...typography.caption, fontSize: 12, fontWeight: '700', color: colors.primary },

    filters: { marginBottom: spacing.md },
    list: { gap: spacing.sm, paddingBottom: spacing['2xl'] },
    statusWrap: { flex: 1, justifyContent: 'space-between' },

    attribution: { gap: 4, paddingTop: spacing.lg, paddingBottom: spacing.md },
    attributionText: { fontFamily, fontSize: 11, color: colors.subtleForeground, textAlign: 'center' },
    disclaimer: {
      fontFamily,
      fontSize: 11,
      lineHeight: 16,
      color: colors.subtleForeground,
      textAlign: 'center',
    },
  });
