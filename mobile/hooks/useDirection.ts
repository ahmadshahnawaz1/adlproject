/**
 * useDirection — the active language's layout direction.
 */
import { useMemo } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { directionFor, type Direction } from '../lib/direction';

export type { Direction };

export default function useDirection(): Direction {
  const { isRTL } = useLocale();
  return useMemo(() => directionFor(isRTL), [isRTL]);
}
