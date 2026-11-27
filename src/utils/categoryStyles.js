import { PII_CATEGORIES } from './piiDetector.js';

/**
 * Consistent color themes per PII category for light-surface badges, highlights, and chips.
 */
export const CATEGORY_STYLES = {
  [PII_CATEGORIES.EMAIL]: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    highlight: 'bg-sky-100 text-sky-900 border-b-2 border-sky-500',
    dot: 'bg-sky-500',
    redactedChip: 'bg-sky-50 text-sky-800 border-sky-300',
  },
  [PII_CATEGORIES.PHONE]: {
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    highlight: 'bg-violet-100 text-violet-900 border-b-2 border-violet-500',
    dot: 'bg-violet-500',
    redactedChip: 'bg-violet-50 text-violet-800 border-violet-300',
  },
  [PII_CATEGORIES.IP]: {
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    highlight: 'bg-cyan-100 text-cyan-900 border-b-2 border-cyan-500',
    dot: 'bg-cyan-500',
    redactedChip: 'bg-cyan-50 text-cyan-800 border-cyan-300',
  },
  [PII_CATEGORIES.PAN]: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    highlight: 'bg-amber-100 text-amber-900 border-b-2 border-amber-500',
    dot: 'bg-amber-500',
    redactedChip: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  [PII_CATEGORIES.AADHAAR]: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    highlight: 'bg-rose-100 text-rose-900 border-b-2 border-rose-500',
    dot: 'bg-rose-500',
    redactedChip: 'bg-rose-50 text-rose-800 border-rose-300',
  },
  [PII_CATEGORIES.CREDIT_CARD]: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    highlight: 'bg-emerald-100 text-emerald-900 border-b-2 border-emerald-500',
    dot: 'bg-emerald-500',
    redactedChip: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  [PII_CATEGORIES.CUSTOM]: {
    badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    highlight: 'bg-fuchsia-100 text-fuchsia-900 border-b-2 border-fuchsia-500',
    dot: 'bg-fuchsia-500',
    redactedChip: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300',
  },
};
