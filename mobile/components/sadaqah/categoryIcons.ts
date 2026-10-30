/**
 * categoryIcons — maps each charity category to its lucide glyph, so the card,
 * the entry sheet and the history screen render the same icon set from one
 * source. (The catalog in lib/charity carries the icon *name*; this resolves it
 * to a component, keeping the pure layer free of UI imports.)
 */
import {
  HandCoins,
  Scale,
  Sprout,
  Utensils,
  Wheat,
  type LucideIcon,
} from 'lucide-react-native';

import type { CharityCategory } from '../../lib/charity';

export const CATEGORY_ICONS: Record<CharityCategory, LucideIcon> = {
  zakat: Scale,
  sadaqah: HandCoins,
  'sadaqah-jariyah': Sprout,
  fitrana: Wheat,
  'fidya-kaffara': Utensils,
};
