/**
 * Direction logic, kept free of React so it can be tested without a provider.
 *
 * The app does not call `I18nManager.forceRTL`, which would need a restart and
 * flip every layout blindly. A screen asks for the direction it should lay out
 * in instead, so Arabic and Urdu mirror properly and switching stays instant.
 */
import type { FlexStyle, TextStyle } from 'react-native';

export type Direction = {
  isRTL: boolean;
  /** For a row that should follow the reading direction. */
  row: FlexStyle['flexDirection'];
  /** For a row that should stay put regardless of language. */
  rowFixed: FlexStyle['flexDirection'];
  textAlign: TextStyle['textAlign'];
  /** Alignment for the opposite edge, e.g. a trailing value. */
  textAlignEnd: TextStyle['textAlign'];
  writingDirection: TextStyle['writingDirection'];
  start: 'left' | 'right';
  end: 'left' | 'right';
  /** Multiplier for a chevron or arrow that points "forward". */
  flip: 1 | -1;
};

export function directionFor(isRTL: boolean): Direction {
  return {
    isRTL,
    row: isRTL ? 'row-reverse' : 'row',
    rowFixed: 'row',
    textAlign: isRTL ? 'right' : 'left',
    textAlignEnd: isRTL ? 'left' : 'right',
    writingDirection: isRTL ? 'rtl' : 'ltr',
    start: isRTL ? 'right' : 'left',
    end: isRTL ? 'left' : 'right',
    flip: isRTL ? -1 : 1,
  };
}

export const LTR = directionFor(false);
export const RTL = directionFor(true);
