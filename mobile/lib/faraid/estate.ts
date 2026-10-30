/**
 * What is actually divisible.
 *
 * Nothing reaches the heirs until four claims are settled in order: burial
 * costs, then debts, then any bequest — and a bequest may not exceed a third
 * of what is left, on the ḥadīth of Saʿd ibn Abī Waqqāṣ (al-Bukhārī 2742,
 * Muslim 1628): "A third, and a third is a great deal."
 */
export type EstateInput = {
  gross: number;
  funeral: number;
  debts: number;
  bequest: number;
};

export type EstateBreakdown = {
  gross: number;
  funeral: number;
  debts: number;
  /** What the bequest may actually pay out after the one-third cap. */
  bequest: number;
  requestedBequest: number;
  bequestCapped: boolean;
  bequestCap: number;
  /** The amount the heirs divide. */
  net: number;
  /** True when debts and burial swallow the estate — heirs receive nothing. */
  insolvent: boolean;
};

const clean = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

export function breakdown(input: Partial<EstateInput>): EstateBreakdown {
  const gross = clean(input.gross ?? 0);
  const funeral = clean(input.funeral ?? 0);
  const debts = clean(input.debts ?? 0);
  const requestedBequest = clean(input.bequest ?? 0);

  const afterDebts = gross - funeral - debts;
  if (afterDebts <= 0) {
    return {
      gross, funeral, debts,
      bequest: 0,
      requestedBequest,
      bequestCapped: requestedBequest > 0,
      bequestCap: 0,
      net: 0,
      insolvent: true,
    };
  }

  const bequestCap = afterDebts / 3;
  const bequest = Math.min(requestedBequest, bequestCap);

  return {
    gross, funeral, debts,
    bequest,
    requestedBequest,
    bequestCapped: requestedBequest > bequestCap,
    bequestCap,
    net: afterDebts - bequest,
    insolvent: false,
  };
}
