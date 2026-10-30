/**
 * AdditiveLibrary — browse and search the reference without scanning anything.
 */
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { normalizeText, queryTokens } from '../../lib/duaSearch';
import { ADDITIVES, STATUS_LABEL, type Additive } from '../../content/halal';
import { fontFamily, radius, spacing, typography } from '../../theme/tokens';
import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

const BROWSE_LIMIT = 40;
const SEARCH_LIMIT = 60;

export default function AdditiveLibrary({ onSelect }: { onSelect: (additive: Additive) => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const tokens = queryTokens(query);
    // With no query, lead with the entries that actually need attention.
    if (tokens.length === 0) {
      return ADDITIVES.filter((a) => a.status !== 'clear').slice(0, BROWSE_LIMIT);
    }
    return ADDITIVES.filter((a) => {
      const hay = normalizeText(`${a.code} ${a.name} ${(a.aliases ?? []).join(' ')}`);
      return tokens.every((t) => hay.includes(t));
    }).slice(0, SEARCH_LIMIT);
  }, [query]);

  const toneFor = (a: Additive) =>
    a.status === 'prohibited'
      ? colors.destructive
      : a.status === 'clear'
        ? colors.border
        : colors.primary;

  return (
    <View style={styles.wrap}>
      <View style={styles.searchRow}>
        <Search size={16} color={colors.subtleForeground} strokeWidth={2.25} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search E-numbers and ingredients"
          placeholderTextColor={colors.subtleForeground}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="Search additives"
        />
      </View>

      <AppText style={styles.hint}>
        {query.trim()
          ? `${results.length} match${results.length === 1 ? '' : 'es'}`
          : 'Showing the ingredients that need attention. Search to see all ' + ADDITIVES.length + '.'}
      </AppText>

      {results.length === 0 ? (
        <AppText style={styles.empty}>
          Nothing matches that. Try the E-number, or a word from the ingredient's name.
        </AppText>
      ) : null}

      {results.map((a) => (
        <Pressable
          key={a.code}
          onPress={() => onSelect(a)}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={`${a.code}, ${a.name}, ${STATUS_LABEL[a.status]}`}
        >
          <View style={styles.text}>
            <AppText style={styles.name}>{a.name}</AppText>
            <AppText style={styles.meta}>
              {a.code} · {STATUS_LABEL[a.status]}
            </AppText>
          </View>
          <View style={[styles.dot, { backgroundColor: toneFor(a) }]} />
        </Pressable>
      ))}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: spacing.xs },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.card,
    },
    searchInput: {
      flex: 1,
      fontFamily,
      fontSize: 14,
      color: colors.foreground,
      paddingVertical: spacing.sm,
      minHeight: 44,
    },
    hint: { ...typography.caption, fontSize: 11, color: colors.subtleForeground, paddingVertical: spacing.xs },
    empty: {
      fontFamily,
      fontSize: 13,
      lineHeight: 20,
      color: colors.subtleForeground,
      paddingVertical: spacing.lg,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      minHeight: 54,
    },
    text: { flex: 1, gap: 2 },
    name: { fontFamily, fontSize: 14, color: colors.foreground },
    meta: { ...typography.caption, fontSize: 11, color: colors.subtleForeground },
    dot: { width: 8, height: 8, borderRadius: 4 },
  });
