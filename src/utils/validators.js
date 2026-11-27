/**
 * Client-side cryptographic/checksum and format validators for PII detection.
 * Runs 100% locally in the browser with zero network calls.
 */

// Verhoeff multiplication table (d)
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Verhoeff permutation table (p)
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

// Verhoeff inverse table (inv)
const VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Strip all non-digit characters from an input string.
 * @param {string} value
 * @returns {string}
 */
export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/**
 * Validate a credit card candidate (13-19 digits) using the Luhn (mod 10) algorithm.
 * Rejects repeated identical digits (e.g., 0000000000000000) which trivially pass mod 10.
 * @param {string} candidate
 * @returns {boolean}
 */
export function isValidLuhn(candidate) {
  const digits = digitsOnly(candidate);
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = digits.charCodeAt(i) - 48;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Validate an Indian Aadhaar number format (12 digits starting with 2-9).
 * @param {string} candidate
 * @returns {boolean}
 */
export function isValidAadhaarFormat(candidate) {
  const digits = digitsOnly(candidate);
  return /^[2-9]\d{11}$/.test(digits);
}

/**
 * Validate an Indian Aadhaar number using the Verhoeff checksum algorithm.
 * @param {string} candidate
 * @returns {boolean}
 */
export function isValidVerhoeff(candidate) {
  const digits = digitsOnly(candidate);
  if (!/^[2-9]\d{11}$/.test(digits)) {
    return false;
  }

  let c = 0;
  for (let i = 0; i < digits.length; i += 1) {
    const digit = digits.charCodeAt(digits.length - 1 - i) - 48;
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digit]];
  }

  return c === 0;
}

/**
 * Compute a valid Verhoeff check digit for an 11-digit prefix.
 * Useful for verifying/generating valid synthetic Aadhaar test numbers.
 * @param {string} elevenDigits
 * @returns {string}
 */
export function computeVerhoeffCheckDigit(elevenDigits) {
  const digits = digitsOnly(elevenDigits);
  if (digits.length !== 11) {
    throw new Error('Expected 11 digits to compute Verhoeff check digit');
  }
  let c = 0;
  for (let i = 0; i < digits.length; i += 1) {
    const digit = digits.charCodeAt(digits.length - 1 - i) - 48;
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][digit]];
  }
  return String(VERHOEFF_INV[c]);
}

/**
 * Validate an Indian PAN string ([A-Z]{5}[0-9]{4}[A-Z]).
 * @param {string} candidate
 * @returns {boolean}
 */
export function isValidPan(candidate) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(candidate ?? ''));
}

/**
 * Validate an IPv4 address (4 octets, each 0-255, no leading zeros except "0").
 * @param {string} candidate
 * @returns {boolean}
 */
export function isValidIPv4(candidate) {
  const parts = String(candidate ?? '').split('.');
  if (parts.length !== 4) {
    return false;
  }
  return parts.every((part) => {
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) {
      return false;
    }
    const num = Number(part);
    return num >= 0 && num <= 255;
  });
}

/**
 * Validate an IPv6 address (supports full, :: compressed, and IPv4-mapped forms).
 * @param {string} candidate
 * @returns {boolean}
 */
export function isValidIPv6(candidate) {
  let value = String(candidate ?? '').trim();
  if (!value || !value.includes(':')) {
    return false;
  }

  // Strip optional zone index (e.g., %eth0)
  const zoneIdx = value.indexOf('%');
  if (zoneIdx !== -1) {
    value = value.slice(0, zoneIdx);
  }

  const doubleColonParts = value.split('::');
  if (doubleColonParts.length > 2) {
    return false;
  }

  const hasCompression = doubleColonParts.length === 2;
  const leftGroups = doubleColonParts[0] ? doubleColonParts[0].split(':') : [];
  const rightGroups = hasCompression && doubleColonParts[1] ? doubleColonParts[1].split(':') : [];

  // Check if the final group is an embedded IPv4 address (e.g., ::ffff:192.0.2.128)
  let ipv4Embedded = false;
  if (rightGroups.length > 0 && rightGroups[rightGroups.length - 1].includes('.')) {
    const last = rightGroups.pop();
    if (!isValidIPv4(last)) {
      return false;
    }
    ipv4Embedded = true;
  } else if (!hasCompression && leftGroups.length > 0 && leftGroups[leftGroups.length - 1].includes('.')) {
    const last = leftGroups.pop();
    if (!isValidIPv4(last)) {
      return false;
    }
    ipv4Embedded = true;
  }

  const isHexGroup = (g) => /^[0-9a-fA-F]{1,4}$/.test(g);
  if (!leftGroups.every(isHexGroup) || !rightGroups.every(isHexGroup)) {
    return false;
  }

  const groupCount = leftGroups.length + rightGroups.length + (ipv4Embedded ? 2 : 0);
  if (hasCompression) {
    return groupCount < 8;
  }
  return groupCount === 8;
}
