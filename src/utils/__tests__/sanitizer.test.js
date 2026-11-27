import { describe, it, expect } from 'vitest';
import {
  isValidLuhn,
  isValidVerhoeff,
  computeVerhoeffCheckDigit,
  isValidIPv4,
  isValidIPv6,
  isValidPan,
} from '../validators.js';
import { detectPII, PII_CATEGORIES } from '../piiDetector.js';
import {
  redactText,
  REDACTION_MODES,
  createPseudonymRegistry,
} from '../redactor.js';
import { parseCsv, serializeCsv } from '../csvParser.js';
import { sanitizeCsvData } from '../csvSanitizer.js';
import { SAMPLE_CSV_TEXT, SAMPLE_RAW_TEXT } from '../sampleData.js';

describe('Validators', () => {
  it('validates Luhn credit cards accurately and rejects random 16-digit numbers', () => {
    expect(isValidLuhn('4532-0151-1283-0366')).toBe(true);
    expect(isValidLuhn('5425 2334 3010 9903')).toBe(true);
    expect(isValidLuhn('4532-0151-1283-0367')).toBe(false);
    expect(isValidLuhn('9988776655443322')).toBe(false);
    expect(isValidLuhn('0000000000000000')).toBe(false);
    expect(isValidLuhn('12345')).toBe(false);
  });

  it('validates Verhoeff Aadhaar checksums and rejects invalid check digits', () => {
    const check1 = computeVerhoeffCheckDigit('23412341234');
    const validAadhaar = `23412341234${check1}`;
    const badDigit = String((Number(check1) + 1) % 10);
    const invalidAadhaar = `23412341234${badDigit}`;

    expect(isValidVerhoeff(validAadhaar)).toBe(true);
    expect(isValidVerhoeff(invalidAadhaar)).toBe(false);
    expect(isValidVerhoeff('134123412346')).toBe(false); // Starts with 1 (invalid)
  });

  it('validates PAN, IPv4, and IPv6 formats', () => {
    expect(isValidPan('ABCDE1234F')).toBe(true);
    expect(isValidPan('abcde1234f')).toBe(false);
    expect(isValidIPv4('192.168.1.45')).toBe(true);
    expect(isValidIPv4('299.168.1.404')).toBe(false);
    expect(isValidIPv4('01.2.3.4')).toBe(false);
    expect(isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
    expect(isValidIPv6('2001:db8::1')).toBe(true);
    expect(isValidIPv6('::1')).toBe(true);
    expect(isValidIPv6('2001:::1')).toBe(false);
  });
});

describe('PII Detector & Overlap Resolution', () => {
  it('detects all standard PII categories and counts rejected false positives', () => {
    const validAadhaar = `2341 2341 234${computeVerhoeffCheckDigit('23412341234')}`;
    const text = [
      'Email: r.sharma@example.com',
      'Phone: +91-9876543210 and +1 (415) 555-0198',
      'PAN: ABCDE1234F',
      `Aadhaar OK: ${validAadhaar} | Aadhaar Bad: 2341 2341 2345`,
      'Card OK: 4532-0151-1283-0366 | Card Bad: 9988776655443322',
      'IPs: 192.168.14.88, 299.168.1.1, 2001:db8::1',
    ].join('\n');

    const res = detectPII(text);
    expect(res.counts.EMAIL).toBe(1);
    expect(res.counts.PHONE).toBe(2);
    expect(res.counts.PAN).toBe(1);
    expect(res.counts.AADHAAR).toBe(1);
    expect(res.counts.CREDIT_CARD).toBe(1);
    expect(res.counts.IP).toBe(2);

    // Rejected false positives: 1 bad card, 1 bad IPv4, and bad Aadhaar
    expect(res.rejectedCounts.CREDIT_CARD).toBe(1);
    expect(res.rejectedCounts.IP).toBe(1);
    expect(res.rejectedCounts.AADHAAR).toBe(1);
  });

  it('supports aadhaarFormatOnly toggle for synthetic test data', () => {
    const text = 'Synthetic Aadhaar: 2341 2341 2345';
    const strict = detectPII(text, { aadhaarFormatOnly: false });
    expect(strict.counts.AADHAAR).toBe(0);
    expect(strict.rejectedCounts.AADHAAR).toBe(1);

    const relaxed = detectPII(text, { aadhaarFormatOnly: true });
    expect(relaxed.counts.AADHAAR).toBe(1);
    expect(relaxed.rejectedCounts.AADHAAR).toBe(0);
  });

  it('does not flag +91 phone numbers as Aadhaar or Credit Card', () => {
    const text = 'Call +91 98765 43210 or +91-9876543210 immediately.';
    const res = detectPII(text);
    expect(res.counts.PHONE).toBe(2);
    expect(res.counts.AADHAAR).toBe(0);
    expect(res.counts.CREDIT_CARD).toBe(0);
  });

  it('supports custom regex/keyword rules and resolves overlaps cleanly', () => {
    const text = 'Agent EMP-8841 emailed r.sharma@example.com';
    const res = detectPII(text, {
      customRules: [
        { id: 'r1', name: 'Employee ID', pattern: 'EMP-\\d{4}', isRegex: true, enabled: true },
      ],
    });
    expect(res.counts.CUSTOM).toBe(1);
    expect(res.counts.EMAIL).toBe(1);
    expect(res.matches.find((m) => m.category === PII_CATEGORIES.CUSTOM)?.value).toBe('EMP-8841');
  });
});

describe('Redactor Modes', () => {
  it('performs Full, Partial, and Consistent Pseudonym redaction', () => {
    const text = 'Mail rohan@example.com, PAN ABCDE1234F, Card 4532-0151-1283-0366, IP 192.168.14.88, Mail rohan@example.com';
    const { matches } = detectPII(text);

    const full = redactText(text, matches, REDACTION_MODES.FULL);
    expect(full.sanitizedText).toContain('[REDACTED_EMAIL]');
    expect(full.sanitizedText).toContain('[REDACTED_PAN]');
    expect(full.sanitizedText).toContain('[REDACTED_CARD]');
    expect(full.sanitizedText).toContain('[REDACTED_IP]');

    const partial = redactText(text, matches, REDACTION_MODES.PARTIAL);
    expect(partial.sanitizedText).toContain('r***@example.com');
    expect(partial.sanitizedText).toContain('ABCXXXX34F');
    expect(partial.sanitizedText).toContain('XXXX-XXXX-XXXX-0366');
    expect(partial.sanitizedText).toContain('192.168.XXX.XXX');

    const registry = createPseudonymRegistry();
    const pseudo = redactText(text, matches, REDACTION_MODES.PSEUDONYM, registry);
    expect(pseudo.sanitizedText).toContain('EMAIL_01');
    expect(pseudo.sanitizedText).not.toContain('EMAIL_02');
    expect(pseudo.sanitizedText).toContain('PAN_01');
    expect(pseudo.sanitizedText).toContain('CARD_01');
    expect(pseudo.sanitizedText).toContain('IP_01');
    expect(registry.toJSON().totalUniqueEntities).toBe(4);
  });
});

describe('CSV Parser & Serializer', () => {
  it('parses quoted CSV fields with embedded commas, quotes, and newlines', () => {
    const csv = 'name,notes,email\n"Doe, Jane","Says ""hi"",\nplease call",jane@example.com';
    const parsed = parseCsv(csv, true);
    expect(parsed.headers).toEqual(['name', 'notes', 'email']);
    expect(parsed.rows.length).toBe(1);
    expect(parsed.rows[0][0]).toBe('Doe, Jane');
    expect(parsed.rows[0][1]).toBe('Says "hi",\nplease call');
    expect(parsed.rows[0][2]).toBe('jane@example.com');

    const roundTrip = serializeCsv(parsed.headers, parsed.rows, true);
    const reparsed = parseCsv(roundTrip, true);
    expect(reparsed).toEqual(parsed);
  });

  it('sanitizes sample raw text and sample CSV with column selection and shared pseudonyms', () => {
    const rawRes = detectPII(SAMPLE_RAW_TEXT, {
      customRules: [{ id: 'emp', name: 'USER', pattern: 'EMP-\\d{4}', isRegex: true, enabled: true }],
    });
    expect(rawRes.counts.CREDIT_CARD).toBe(2);
    expect(rawRes.counts.AADHAAR).toBe(1);
    expect(rawRes.counts.PAN).toBe(1);
    expect(rawRes.counts.EMAIL).toBe(4);
    expect(rawRes.counts.PHONE).toBe(3);
    expect(rawRes.counts.IP).toBe(5);
    expect(rawRes.counts.CUSTOM).toBe(1);
    expect(rawRes.rejectedCounts.CREDIT_CARD).toBe(2);
    expect(rawRes.rejectedCounts.AADHAAR).toBe(1);
    expect(rawRes.rejectedCounts.IP).toBe(1);

    // CSV: select only email (col 1) and card_number (col 5)
    const csvRes = sanitizeCsvData({
      rawCsv: SAMPLE_CSV_TEXT,
      hasHeader: true,
      selectedColumns: [1, 5],
      mode: REDACTION_MODES.PSEUDONYM,
    });
    expect(csvRes.counts.EMAIL).toBe(3);
    expect(csvRes.counts.CREDIT_CARD).toBe(2);
    expect(csvRes.counts.AADHAAR).toBe(0); // Aadhaar column not selected
    // Row 0 & Row 2 share rohan.sharma@example.com -> EMAIL_01
    expect(csvRes.sanitizedRows[0][1]).toBe('EMAIL_01');
    expect(csvRes.sanitizedRows[2][1]).toBe('EMAIL_01');
    expect(csvRes.sanitizedRows[1][1]).toBe('EMAIL_02');
    expect(csvRes.pseudonymRegistry.size()).toBe(4);
  });
});
