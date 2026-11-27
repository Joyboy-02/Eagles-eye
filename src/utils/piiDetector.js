import {
  digitsOnly,
  isValidAadhaarFormat,
  isValidIPv4,
  isValidIPv6,
  isValidLuhn,
  isValidVerhoeff,
} from './validators.js';

export const PII_CATEGORIES = {
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  IP: 'IP',
  PAN: 'PAN',
  AADHAAR: 'AADHAAR',
  CREDIT_CARD: 'CREDIT_CARD',
  CUSTOM: 'CUSTOM',
};

export const CATEGORY_META = {
  EMAIL: {
    id: 'EMAIL',
    label: 'Email',
    shortLabel: 'EMAIL',
    description: 'Standard email addresses',
  },
  PHONE: {
    id: 'PHONE',
    label: 'Phone Number',
    shortLabel: 'PHONE',
    description: 'Indian (+91 / 10-digit) and international phones',
  },
  IP: {
    id: 'IP',
    label: 'IP Address',
    shortLabel: 'IP',
    description: 'IPv4 (0–255 octets) and IPv6 addresses',
  },
  PAN: {
    id: 'PAN',
    label: 'Indian PAN',
    shortLabel: 'PAN',
    description: '10-character PAN ([A-Z]{5}[0-9]{4}[A-Z])',
  },
  AADHAAR: {
    id: 'AADHAAR',
    label: 'Indian Aadhaar',
    shortLabel: 'AADHAAR',
    description: '12-digit Aadhaar validated with Verhoeff checksum',
  },
  CREDIT_CARD: {
    id: 'CREDIT_CARD',
    label: 'Credit Card',
    shortLabel: 'CARD',
    description: '13–19 digit card numbers validated with Luhn checksum',
  },
  CUSTOM: {
    id: 'CUSTOM',
    label: 'Custom Rules',
    shortLabel: 'CUSTOM',
    description: 'User-defined regex or keyword rules',
  },
};

export const DEFAULT_ENABLED_CATEGORIES = {
  EMAIL: true,
  PHONE: true,
  IP: true,
  PAN: true,
  AADHAAR: true,
  CREDIT_CARD: true,
  CUSTOM: true,
};

// Higher priority wins when two spans overlap equally or conflict
const CATEGORY_PRIORITY = {
  EMAIL: 70,
  CREDIT_CARD: 65,
  AADHAAR: 60,
  PAN: 55,
  IP: 50,
  PHONE: 45,
  CUSTOM: 40,
};

const EMAIL_REGEX =
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;

// Credit card candidate: 13-19 digits with optional single space or hyphen separators,
// never preceded by '+' (international phone prefix) or '.' (decimal/IP)
const CREDIT_CARD_REGEX =
  /(?<![+\d.])\b(?:\d[ -]?){12,18}\d\b(?![\d.])/g;

// Aadhaar candidate: 12 digits starting with 2-9, either contiguous or 4-4-4 separated
// Not preceded by '+' or digits so +91 phones are never confused with Aadhaar
const AADHAAR_REGEX =
  /(?<![+\d.])\b(?:[2-9]\d{11}|[2-9]\d{3}[ -]\d{4}[ -]\d{4})\b(?![\d.-])/g;

// Indian PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;

// IPv4 candidate (validated for 0-255 octets afterwards so invalid octets count as rejected).
// Avoid matching partial 5-part dotted numbers (e.g. 1.2.3.4.5) while still matching IPv4 at sentence end (e.g. "192.168.1.1.").
const IPV4_CANDIDATE_REGEX =
  /(?<![\d.])\b\d{1,3}(?:\.\d{1,3}){3}\b(?!\.\d|\d)/g;

// IPv6 candidate (captures full, compressed ::, loopback ::1, and IPv4-mapped forms)
const IPV6_CANDIDATE_REGEX =
  /(?<![a-fA-F0-9:])(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|::(?:[fF]{4}(?::0{1,4})?:)?(?:\d{1,3}\.){3}\d{1,3}|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:\d{1,3}\.){3}\d{1,3}|::1|::)(?![a-fA-F0-9:])/g;

// Phone numbers:
// 1) Indian +91 / 0 prefixed or 10-digit [6-9]xxxxxxxxx (with optional spaces/hyphens/dots)
// 2) International +<country> <groups>
// 3) North American / general (xxx) xxx-xxxx or xxx-xxx-xxxx
const PHONE_PATTERNS = [
  // Indian +91 or 0 prefix with 10-digit mobile starting 6-9 (allowing 5-5 or 3-3-4 or contiguous)
  /(?<!\w)(?:\+91[\s.-]?|0)[6-9]\d{4}[\s.-]?\d{5}\b/g,
  /(?<!\w)(?:\+91[\s.-]?|0)[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
  // Standalone Indian 10-digit mobile starting 6-9 (contiguous or 5-5)
  /(?<![+\d.])\b[6-9]\d{9}\b(?![\d.])/g,
  /(?<![+\d.])\b[6-9]\d{4}[ -]\d{5}\b(?![\d.])/g,
  // International +<country code> numbers (7-15 digits total)
  /(?<!\w)\+[1-9]\d{0,2}(?:[\s.-]?\(?\d{1,4}\)?){2,5}\b/g,
  // US/Intl (xxx) xxx-xxxx or xxx-xxx-xxxx
  /(?<![+\d.])(?:\(\d{3}\)\s?\d{3}[.-]\d{4}|\b\d{3}[.-]\d{3}[.-]\d{4})\b(?![\d.])/g,
];

function escapeRegex(literal) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compile a user-defined custom rule into a RegExp safely.
 * Returns { regex, error }.
 * @param {object} rule
 */
export function compileCustomRule(rule) {
  if (!rule || !rule.pattern || !rule.pattern.trim()) {
    return { regex: null, error: 'Empty pattern' };
  }
  const flags = rule.caseSensitive ? 'g' : 'gi';
  try {
    const source = rule.isRegex ? rule.pattern : escapeRegex(rule.pattern);
    const regex = new RegExp(source, flags);
    return { regex, error: null };
  } catch (err) {
    return { regex: null, error: err.message || 'Invalid regex' };
  }
}

/**
 * Resolve overlapping candidate matches cleanly:
 * - Sort by start asc, then longer span desc, then category priority desc
 * - Keep non-overlapping spans (if a later span overlaps an accepted span, skip it
 *   unless the later span strictly starts after the accepted span ends).
 * Wait: what if a higher-priority span starts inside a lower-priority span (e.g., an email
 * starting inside a custom keyword, or a credit card vs phone)?
 * Sorting by span length desc -> priority desc -> start asc and greedily placing into
 * non-overlapping intervals guarantees longer & higher-priority matches win cleanly!
 */
function resolveOverlaps(candidates) {
  const sorted = [...candidates].sort((a, b) => {
    const lenDiff = (b.end - b.start) - (a.end - a.start);
    if (lenDiff !== 0) return lenDiff;
    const prioDiff = (CATEGORY_PRIORITY[b.category] ?? 0) - (CATEGORY_PRIORITY[a.category] ?? 0);
    if (prioDiff !== 0) return prioDiff;
    return a.start - b.start;
  });

  const accepted = [];
  for (const item of sorted) {
    const overlaps = accepted.some(
      (existing) => item.start < existing.end && item.end > existing.start
    );
    if (!overlaps) {
      accepted.push(item);
    }
  }

  accepted.sort((a, b) => a.start - b.start);
  return accepted;
}

/**
 * Create an empty counts object for all categories.
 */
export function createEmptyCategoryCounts() {
  return {
    EMAIL: 0,
    PHONE: 0,
    IP: 0,
    PAN: 0,
    AADHAAR: 0,
    CREDIT_CARD: 0,
    CUSTOM: 0,
  };
}

/**
 * Detect and validate PII entities in raw text.
 *
 * @param {string} text
 * @param {object} options
 * @param {Record<string, boolean>} [options.enabledCategories]
 * @param {boolean} [options.aadhaarFormatOnly=false]
 * @param {Array<{id: string, name: string, pattern: string, isRegex: boolean, caseSensitive?: boolean, enabled: boolean}>} [options.customRules]
 * @returns {{
 *   matches: Array<{id: string, category: string, subType?: string, ruleName?: string, value: string, start: number, end: number, validation: string}>,
 *   counts: Record<string, number>,
 *   totalDetected: number,
 *   rejectedCounts: Record<string, number>,
 *   totalRejected: number,
 *   rejectedSamples: Array<{category: string, reason: string, maskedPreview: string}>,
 *   customRuleErrors: Array<{id: string, name: string, error: string}>
 * }}
 */
export function detectPII(text, options = {}) {
  const input = typeof text === 'string' ? text : '';
  const enabled = { ...DEFAULT_ENABLED_CATEGORIES, ...(options.enabledCategories || {}) };
  const aadhaarFormatOnly = Boolean(options.aadhaarFormatOnly);
  const customRules = Array.isArray(options.customRules) ? options.customRules : [];

  const counts = createEmptyCategoryCounts();
  const rejectedCounts = createEmptyCategoryCounts();
  const rejectedSamples = [];
  const customRuleErrors = [];

  if (!input) {
    return {
      matches: [],
      counts,
      totalDetected: 0,
      rejectedCounts,
      totalRejected: 0,
      rejectedSamples,
      customRuleErrors,
    };
  }

  const candidates = [];
  const rejectedRanges = [];

  const recordRejection = (category, start, end, value, reason) => {
    // Avoid double-counting the exact same span
    if (rejectedRanges.some((r) => r.category === category && r.start === start && r.end === end)) {
      return;
    }
    rejectedRanges.push({ category, start, end });
    rejectedCounts[category] = (rejectedCounts[category] ?? 0) + 1;

    // Mask preview so even rejected audit info never leaks sensitive digits unnecessarily
    const preview =
      value.length > 6
        ? `${value.slice(0, 2)}…${value.slice(-2)} (len ${value.length})`
        : value;
    rejectedSamples.push({ category, reason, maskedPreview: preview, start, end });
  };

  // 1. Emails
  if (enabled.EMAIL) {
    EMAIL_REGEX.lastIndex = 0;
    let m;
    while ((m = EMAIL_REGEX.exec(input)) !== null) {
      candidates.push({
        category: PII_CATEGORIES.EMAIL,
        value: m[0],
        start: m.index,
        end: m.index + m[0].length,
        validation: 'RFC format',
      });
    }
  }

  // 2. Credit Cards (Luhn checksum enforced)
  if (enabled.CREDIT_CARD) {
    CREDIT_CARD_REGEX.lastIndex = 0;
    let m;
    while ((m = CREDIT_CARD_REGEX.exec(input)) !== null) {
      const value = m[0];
      const digits = digitsOnly(value);
      if (digits.length < 13 || digits.length > 19) continue;

      if (isValidLuhn(value)) {
        candidates.push({
          category: PII_CATEGORIES.CREDIT_CARD,
          value,
          start: m.index,
          end: m.index + value.length,
          validation: 'Luhn verified',
        });
      } else {
        recordRejection(
          PII_CATEGORIES.CREDIT_CARD,
          m.index,
          m.index + value.length,
          value,
          'Failed Luhn checksum'
        );
      }
    }
  }

  // 3. Aadhaar (Verhoeff checksum enforced unless aadhaarFormatOnly is true)
  if (enabled.AADHAAR) {
    AADHAAR_REGEX.lastIndex = 0;
    let m;
    while ((m = AADHAAR_REGEX.exec(input)) !== null) {
      const value = m[0];
      const start = m.index;
      const end = start + value.length;

      // Skip if this span is completely inside a valid Credit Card candidate
      const insideCard = candidates.some(
        (c) => c.category === PII_CATEGORIES.CREDIT_CARD && start >= c.start && end <= c.end
      );
      if (insideCard) continue;

      if (!isValidAadhaarFormat(value)) continue;

      const verhoeffOk = isValidVerhoeff(value);
      if (verhoeffOk || aadhaarFormatOnly) {
        candidates.push({
          category: PII_CATEGORIES.AADHAAR,
          value,
          start,
          end,
          validation: verhoeffOk ? 'Verhoeff verified' : 'Format-only match',
        });
      } else {
        recordRejection(
          PII_CATEGORIES.AADHAAR,
          start,
          end,
          value,
          'Failed Verhoeff checksum'
        );
      }
    }
  }

  // 4. Indian PAN
  if (enabled.PAN) {
    PAN_REGEX.lastIndex = 0;
    let m;
    while ((m = PAN_REGEX.exec(input)) !== null) {
      candidates.push({
        category: PII_CATEGORIES.PAN,
        value: m[0],
        start: m.index,
        end: m.index + m[0].length,
        validation: 'PAN pattern',
      });
    }
  }

  // 5. IP Addresses (IPv4 0-255 + IPv6)
  if (enabled.IP) {
    IPV6_CANDIDATE_REGEX.lastIndex = 0;
    let m;
    while ((m = IPV6_CANDIDATE_REGEX.exec(input)) !== null) {
      const value = m[0];
      if (isValidIPv6(value)) {
        candidates.push({
          category: PII_CATEGORIES.IP,
          subType: 'IPv6',
          value,
          start: m.index,
          end: m.index + value.length,
          validation: 'IPv6 format',
        });
      }
    }

    IPV4_CANDIDATE_REGEX.lastIndex = 0;
    while ((m = IPV4_CANDIDATE_REGEX.exec(input)) !== null) {
      const value = m[0];
      const start = m.index;
      const end = start + value.length;
      // Skip if embedded inside an already matched IPv6-mapped address
      const insideIPv6 = candidates.some(
        (c) => c.category === PII_CATEGORIES.IP && start >= c.start && end <= c.end
      );
      if (insideIPv6) continue;

      if (isValidIPv4(value)) {
        candidates.push({
          category: PII_CATEGORIES.IP,
          subType: 'IPv4',
          value,
          start,
          end,
          validation: 'IPv4 octets 0–255',
        });
      } else {
        recordRejection(
          PII_CATEGORIES.IP,
          start,
          end,
          value,
          'Invalid IPv4 octet (>255 or leading zero)'
        );
      }
    }
  }

  // 6. Phone Numbers
  if (enabled.PHONE) {
    for (const pattern of PHONE_PATTERNS) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(input)) !== null) {
        const value = m[0];
        const digits = digitsOnly(value);
        if (digits.length < 7 || digits.length > 15) continue;

        candidates.push({
          category: PII_CATEGORIES.PHONE,
          value,
          start: m.index,
          end: m.index + value.length,
          validation: value.startsWith('+') ? 'International / +91' : '10-digit phone',
        });
      }
    }
  }

  // 7. Custom Rules
  if (enabled.CUSTOM && customRules.length > 0) {
    for (const rule of customRules) {
      if (!rule.enabled) continue;
      const { regex, error } = compileCustomRule(rule);
      if (error || !regex) {
        customRuleErrors.push({ id: rule.id, name: rule.name || rule.pattern, error: error || 'Invalid rule' });
        continue;
      }

      let m;
      let guard = 0;
      while ((m = regex.exec(input)) !== null) {
        guard += 1;
        if (guard > 10000) break; // Guard against catastrophic zero-length loops
        if (m[0].length === 0) {
          regex.lastIndex += 1;
          continue;
        }
        candidates.push({
          category: PII_CATEGORIES.CUSTOM,
          ruleName: rule.name || 'Custom',
          value: m[0],
          start: m.index,
          end: m.index + m[0].length,
          validation: `Rule: ${rule.name || 'Custom'}`,
        });
      }
    }
  }

  const resolved = resolveOverlaps(candidates).map((match, idx) => ({
    ...match,
    id: `pii_${idx + 1}_${match.start}`,
  }));

  for (const match of resolved) {
    counts[match.category] = (counts[match.category] ?? 0) + 1;
  }

  const totalDetected = resolved.length;
  const totalRejected = Object.values(rejectedCounts).reduce((acc, n) => acc + n, 0);

  return {
    matches: resolved,
    counts,
    totalDetected,
    rejectedCounts,
    totalRejected,
    rejectedSamples,
    customRuleErrors,
  };
}
