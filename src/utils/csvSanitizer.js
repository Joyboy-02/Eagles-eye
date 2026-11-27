import {
  createEmptyCategoryCounts,
  detectPII,
} from './piiDetector.js';
import {
  createPseudonymRegistry,
  redactText,
  REDACTION_MODES,
} from './redactor.js';
import { parseCsv, serializeCsv } from './csvParser.js';

/**
 * Sanitize a CSV string column-by-column using a shared pseudonym registry
 * so identical PII values across different rows/columns get the same pseudonym.
 */
export function sanitizeCsvData({
  rawCsv,
  hasHeader = true,
  selectedColumns = null,
  detectionOptions = {},
  mode = REDACTION_MODES.FULL,
}) {
  const { headers, rows, columnCount } = parseCsv(rawCsv, hasHeader);
  const activeColumns = new Set(
    Array.isArray(selectedColumns)
      ? selectedColumns
      : headers.map((_, idx) => idx)
  );

  const registry = mode === REDACTION_MODES.PSEUDONYM ? createPseudonymRegistry() : null;
  const counts = createEmptyCategoryCounts();
  const rejectedCounts = createEmptyCategoryCounts();
  const rejectedSamples = [];
  const customRuleErrorsMap = new Map();

  const sanitizedRows = [];
  const cellDiffs = [];

  for (let r = 0; r < rows.length; r += 1) {
    const row = rows[r];
    const outRow = [];
    const rowDiffCells = [];

    for (let c = 0; c < columnCount; c += 1) {
      const cellValue = row[c] ?? '';
      if (!activeColumns.has(c) || !cellValue) {
        outRow.push(cellValue);
        rowDiffCells.push({
          original: cellValue,
          sanitized: cellValue,
          matches: [],
          segments: cellValue ? [{ type: 'text', text: cellValue }] : [],
          selected: activeColumns.has(c),
        });
        continue;
      }

      const detection = detectPII(cellValue, detectionOptions);
      const { sanitizedText, segments } = redactText(
        cellValue,
        detection.matches,
        mode,
        registry
      );

      for (const [cat, n] of Object.entries(detection.counts)) {
        counts[cat] = (counts[cat] ?? 0) + n;
      }
      for (const [cat, n] of Object.entries(detection.rejectedCounts)) {
        rejectedCounts[cat] = (rejectedCounts[cat] ?? 0) + n;
      }
      for (const sample of detection.rejectedSamples) {
        if (rejectedSamples.length < 50) {
          rejectedSamples.push({ ...sample, row: r + 1, column: headers[c] });
        }
      }
      for (const err of detection.customRuleErrors) {
        customRuleErrorsMap.set(err.id, err);
      }

      outRow.push(sanitizedText);
      rowDiffCells.push({
        original: cellValue,
        sanitized: sanitizedText,
        matches: detection.matches,
        segments,
        selected: true,
      });
    }

    sanitizedRows.push(outRow);
    cellDiffs.push(rowDiffCells);
  }

  const sanitizedCsv = serializeCsv(headers, sanitizedRows, hasHeader);
  const totalDetected = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalRejected = Object.values(rejectedCounts).reduce((a, b) => a + b, 0);

  return {
    headers,
    rows,
    sanitizedRows,
    cellDiffs,
    sanitizedCsv,
    counts,
    totalDetected,
    rejectedCounts,
    totalRejected,
    rejectedSamples,
    customRuleErrors: Array.from(customRuleErrorsMap.values()),
    pseudonymRegistry: registry,
  };
}
