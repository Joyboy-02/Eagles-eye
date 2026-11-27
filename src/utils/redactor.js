import { PII_CATEGORIES } from './piiDetector.js';
import { digitsOnly } from './validators.js';

export const REDACTION_MODES = {
  FULL: 'full',
  PARTIAL: 'partial',
  PSEUDONYM: 'pseudonym',
};

const FULL_MASK_LABELS = {
  [PII_CATEGORIES.CREDIT_CARD]: '[REDACTED_CARD]',
  [PII_CATEGORIES.PAN]: '[REDACTED_PAN]',
  [PII_CATEGORIES.AADHAAR]: '[REDACTED_AADHAAR]',
  [PII_CATEGORIES.EMAIL]: '[REDACTED_EMAIL]',
  [PII_CATEGORIES.PHONE]: '[REDACTED_PHONE]',
  [PII_CATEGORIES.IP]: '[REDACTED_IP]',
};

const PSEUDONYM_PREFIXES = {
  [PII_CATEGORIES.CREDIT_CARD]: 'CARD',
  [PII_CATEGORIES.PAN]: 'PAN',
  [PII_CATEGORIES.AADHAAR]: 'AADHAAR',
  [PII_CATEGORIES.EMAIL]: 'EMAIL',
  [PII_CATEGORIES.PHONE]: 'PHONE',
  [PII_CATEGORIES.IP]: 'IP',
  [PII_CATEGORIES.CUSTOM]: 'USER',
};

function sanitizeRuleTag(name) {
  const cleaned = String(name || 'CUSTOM')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned || 'CUSTOM';
}

/**
 * Normalize a matched PII value so identical entities across formatting variants
 * (e.g., spaces vs hyphens in cards/Aadhaar, uppercase/lowercase emails) map to
 * the same consistent pseudonym.
 */
export function normalizeMatchKey(match) {
  switch (match.category) {
    case PII_CATEGORIES.EMAIL:
      return `EMAIL:${match.value.trim().toLowerCase()}`;
    case PII_CATEGORIES.CREDIT_CARD:
      return `CARD:${digitsOnly(match.value)}`;
    case PII_CATEGORIES.AADHAAR:
      return `AADHAAR:${digitsOnly(match.value)}`;
    case PII_CATEGORIES.PHONE:
      return `PHONE:${digitsOnly(match.value)}`;
    case PII_CATEGORIES.PAN:
      return `PAN:${match.value.trim().toUpperCase()}`;
    case PII_CATEGORIES.IP:
      return `IP:${match.value.trim().toLowerCase()}`;
    case PII_CATEGORIES.CUSTOM:
      return `CUSTOM:${sanitizeRuleTag(match.ruleName)}:${match.value}`;
    default:
      return `${match.category}:${match.value}`;
  }
}

/**
 * Generate a partial mask preserving verification context.
 * Examples:
 * - Card: XXXX-XXXX-XXXX-1234
 * - Aadhaar: XXXX-XXXX-9012
 * - PAN: ABCXXXX12F
 * - Email: r***@example.com
 * - Phone: +91-XXXXXX3210
 * - IPv4: 192.168.XXX.XXX
 */
export function partialMaskValue(match) {
  const { category, value } = match;

  switch (category) {
    case PII_CATEGORIES.CREDIT_CARD: {
      const digits = digitsOnly(value);
      const last4 = digits.slice(-4);
      if (/[ -]/.test(value)) {
        // Replace all digits except the last 4 digits with 'X' while preserving separators
        let digitIdx = 0;
        const keepFrom = digits.length - 4;
        return value.replace(/\d/g, (ch) => {
          const out = digitIdx >= keepFrom ? ch : 'X';
          digitIdx += 1;
          return out;
        });
      }
      // Contiguous digits -> group cleanly as XXXX-XXXX-XXXX-1234 (or X chunks + last4)
      const prefixLen = digits.length - 4;
      const chunks = [];
      for (let i = 0; i < prefixLen; i += 4) {
        chunks.push('X'.repeat(Math.min(4, prefixLen - i)));
      }
      chunks.push(last4);
      return chunks.join('-');
    }

    case PII_CATEGORIES.AADHAAR: {
      const digits = digitsOnly(value);
      const last4 = digits.slice(-4);
      if (/[ -]/.test(value)) {
        let digitIdx = 0;
        return value.replace(/\d/g, (ch) => {
          const out = digitIdx >= 8 ? ch : 'X';
          digitIdx += 1;
          return out;
        });
      }
      return `XXXX-XXXX-${last4}`;
    }

    case PII_CATEGORIES.PAN: {
      // Example: ABCDE1234F -> ABCXXXX34F (first 3, XXXX, last 3)
      if (value.length === 10) {
        return `${value.slice(0, 3)}XXXX${value.slice(7)}`;
      }
      return `${value.slice(0, 2)}XXXX${value.slice(-2)}`;
    }

    case PII_CATEGORIES.EMAIL: {
      const atIdx = value.indexOf('@');
      if (atIdx <= 0) return '[REDACTED_EMAIL]';
      const local = value.slice(0, atIdx);
      const domain = value.slice(atIdx);
      return `${local[0]}***${domain}`;
    }

    case PII_CATEGORIES.PHONE: {
      const digits = digitsOnly(value);
      const last4 = digits.slice(-4);
      // Detect country code if starts with '+'
      const intlMatch = value.match(/^(\+\d{1,3})([\s.-]?)(.+)$/);
      if (intlMatch) {
        const cc = intlMatch[1];
        const ccDigits = digitsOnly(cc);
        const remainingDigits = Math.max(0, digits.length - ccDigits.length - 4);
        return `${cc}-${'X'.repeat(remainingDigits)}${last4}`;
      }
      const maskedCount = Math.max(0, digits.length - 4);
      return `${'X'.repeat(maskedCount)}${last4}`;
    }

    case PII_CATEGORIES.IP: {
      if (value.includes('.') && !value.includes(':')) {
        const octets = value.split('.');
        if (octets.length === 4) {
          return `${octets[0]}.${octets[1]}.XXX.XXX`;
        }
      }
      if (value.includes(':')) {
        const parts = value.split(':');
        if (parts.length >= 3) {
          return `${parts[0] || '0'}:${parts[1] || '0'}:XXXX:XXXX`;
        }
        return 'XXXX::XXXX';
      }
      return '[REDACTED_IP]';
    }

    case PII_CATEGORIES.CUSTOM: {
      if (value.length <= 3) return 'X'.repeat(value.length);
      return `${value[0]}${'X'.repeat(value.length - 2)}${value[value.length - 1]}`;
    }

    default:
      return '[REDACTED]';
  }
}

/**
 * Create a stateful pseudonym registry so repeated PII across a document
 * or across CSV cells/rows maps consistently (e.g., EMAIL_01, USER_01).
 */
export function createPseudonymRegistry() {
  const valueToToken = new Map();
  const categoryCounters = {};

  return {
    getToken(match) {
      const key = normalizeMatchKey(match);
      if (valueToToken.has(key)) {
        return valueToToken.get(key).token;
      }

      const prefix =
        match.category === PII_CATEGORIES.CUSTOM && match.ruleName
          ? sanitizeRuleTag(match.ruleName)
          : PSEUDONYM_PREFIXES[match.category] || 'PII';

      const nextCount = (categoryCounters[prefix] ?? 0) + 1;
      categoryCounters[prefix] = nextCount;
      const token = `${prefix}_${String(nextCount).padStart(2, '0')}`;

      valueToToken.set(key, {
        token,
        category: match.category,
        ruleName: match.ruleName || null,
        original: match.value,
      });

      return token;
    },

    /**
     * Export the session mapping as a plain JSON-serializable object.
     */
    toJSON() {
      const mappings = [];
      for (const entry of valueToToken.values()) {
        mappings.push({
          pseudonym: entry.token,
          category: entry.category,
          ...(entry.ruleName ? { ruleName: entry.ruleName } : {}),
          original: entry.original,
        });
      }
      return {
        exportedAt: new Date().toISOString(),
        privacyNote: 'Generated 100% client-side. Store this mapping securely if re-identification is required.',
        totalUniqueEntities: mappings.length,
        mappings,
      };
    },

    size() {
      return valueToToken.size;
    },
  };
}

/**
 * Compute replacement string for a single match under the selected mode.
 */
export function getReplacementText(match, mode, registry = null) {
  if (mode === REDACTION_MODES.PARTIAL) {
    return partialMaskValue(match);
  }
  if (mode === REDACTION_MODES.PSEUDONYM) {
    const activeRegistry = registry || createPseudonymRegistry();
    return activeRegistry.getToken(match);
  }
  // Default: FULL mask
  if (match.category === PII_CATEGORIES.CUSTOM) {
    const tag = match.ruleName ? sanitizeRuleTag(match.ruleName) : 'CUSTOM';
    return `[REDACTED_${tag}]`;
  }
  return FULL_MASK_LABELS[match.category] || '[REDACTED]';
}

/**
 * Apply redaction to raw text given its detected matches.
 * Returns both the sanitized string and span segments for rich diff rendering.
 */
export function redactText(text, matches, mode = REDACTION_MODES.FULL, registry = null) {
  const input = typeof text === 'string' ? text : '';
  if (!matches || matches.length === 0) {
    return {
      sanitizedText: input,
      segments: input ? [{ type: 'text', text: input }] : [],
    };
  }

  const activeRegistry =
    mode === REDACTION_MODES.PSEUDONYM ? registry || createPseudonymRegistry() : null;

  let cursor = 0;
  let output = '';
  const segments = [];

  for (const match of matches) {
    if (match.start > cursor) {
      const plain = input.slice(cursor, match.start);
      output += plain;
      segments.push({ type: 'text', text: plain });
    }

    const replacement = getReplacementText(match, mode, activeRegistry);
    output += replacement;
    segments.push({
      type: 'pii',
      category: match.category,
      ruleName: match.ruleName,
      validation: match.validation,
      original: match.value,
      replacement,
      id: match.id,
    });

    cursor = match.end;
  }

  if (cursor < input.length) {
    const tail = input.slice(cursor);
    output += tail;
    segments.push({ type: 'text', text: tail });
  }

  return {
    sanitizedText: output,
    segments,
  };
}
