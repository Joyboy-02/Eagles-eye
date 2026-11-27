import { PII_CATEGORIES } from './piiDetector.js';

/**
 * Consistent color themes per PII category for highlights, badges, and pills.
 */
export const CATEGORY_STYLES = {
  [PII_CATEGORIES.EMAIL]: {
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    highlight: 'bg-sky-500/20 text-sky-200 border-b-2 border-sky-400',
    dot: 'bg-sky-400',
    redactedChip: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
  },
  [PII_CATEGORIES.PHONE]: {
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/40',
    highlight: 'bg-violet-500/20 text-violet-200 border-b-2 border-violet-400',
    dot: 'bg-violet-400',
    redactedChip: 'bg-violet-950/80 text-violet-300 border-violet-500/40',
  },
  [PII_CATEGORIES.IP]: {
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    highlight: 'bg-cyan-500/20 text-cyan-200 border-b-2 border-cyan-400',
    dot: 'bg-cyan-400',
    redactedChip: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
  },
  [PII_CATEGORIES.PAN]: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    highlight: 'bg-amber-500/20 text-amber-200 border-b-2 border-amber-400',
    dot: 'bg-amber-400',
    redactedChip: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
  },
  [PII_CATEGORIES.AADHAAR]: {
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    highlight: 'bg-rose-500/20 text-rose-200 border-b-2 border-rose-400',
    dot: 'bg-rose-400',
    redactedChip: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
  },
  [PII_CATEGORIES.CREDIT_CARD]: {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    highlight: 'bg-emerald-500/20 text-emerald-200 border-b-2 border-emerald-400',
    dot: 'bg-emerald-400',
    redactedChip: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  },
  [PII_CATEGORIES.CUSTOM]: {
    badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40',
    highlight: 'bg-fuchsia-500/20 text-fuchsia-200 border-b-2 border-fuchsia-400',
    dot: 'bg-fuchsia-400',
    redactedChip: 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/40',
  },
};
