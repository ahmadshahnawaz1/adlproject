/** Shared shape for ADL's legal documents, rendered by LegalScreen. */

export type LegalSection = {
  /** e.g. "1. Acceptance of These Terms" */
  heading: string;
  /** Free-flowing paragraphs. */
  paragraphs?: string[];
  /** Bulleted points, rendered with a subtle marker. */
  bullets?: string[];
};

export type LegalDocument = {
  /** Screen title, e.g. "Terms of Service". */
  title: string;
  /** Short eyebrow above the title. */
  eyebrow: string;
  /** "Last updated" date string. */
  updated: string;
  /** Effective date string. */
  effective: string;
  /** Opening summary paragraphs shown before the numbered sections. */
  intro: string[];
  sections: LegalSection[];
  /** Closing contact / signature block. */
  closing: string[];
};
