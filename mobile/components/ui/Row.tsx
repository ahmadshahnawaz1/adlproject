/**
 * Row — a flex row that reads in the active language's direction, and
 * DirectionalIcon, for a chevron or arrow that should point the way the
 * language runs.
 */
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import useDirection from '../../hooks/useDirection';

export default function Row({
  children,
  style,
  /** Keep left-to-right regardless of language — for numerals or media controls. */
  fixed = false,
  ...rest
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  fixed?: boolean;
} & Omit<React.ComponentProps<typeof View>, 'style' | 'children'>) {
  const dir = useDirection();
  return (
    <View style={[{ flexDirection: fixed ? dir.rowFixed : dir.row }, style]} {...rest}>
      {children}
    </View>
  );
}

/** Mirrors its child horizontally in a right-to-left language. */
export function DirectionalIcon({ children }: { children: ReactNode }) {
  const dir = useDirection();
  if (!dir.isRTL) return <>{children}</>;
  return <View style={{ transform: [{ scaleX: -1 }] }}>{children}</View>;
}
