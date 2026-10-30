/**
 * DuaSearchBar — a calm search field for the Duʿāʾ Library. Controlled by the
 * screen; shows a leading magnifier and a trailing clear button when there is
 * text. Search is forgiving of diacritics and case (see lib/duaSearch).
 */
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, fontFamily, radius, spacing, typography } from '../theme/tokens';

export default function DuaSearchBar({
  value,
  onChangeText,
  placeholder = 'Search supplications…',
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Search size={18} color={colors.subtleForeground} strokeWidth={2} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtleForeground}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} style={styles.clear}>
          <X size={16} color={colors.mutedForeground} strokeWidth={2.25} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: typography.body.fontSize,
    color: colors.foreground,
    paddingVertical: 0,
  },
  clear: { padding: 2 },
});
