/**
 * RFC-4180 compliant client-side CSV parser and serializer.
 * Handles quoted fields, escaped quotes (""), embedded newlines, and CRLF/LF.
 */

/**
 * Parse a CSV string into a 2D array of cell strings.
 * @param {string} rawText
 * @returns {string[][]}
 */
export function parseCsvMatrix(rawText) {
  const text = String(rawText ?? '').replace(/^\uFEFF/, ''); // Strip optional UTF-8 BOM
  if (!text) return [];

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentField += '"';
        i += 1; // Skip escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
      continue;
    }

    if (ch === '"' && currentField.length === 0) {
      inQuotes = true;
    } else if (ch === ',') {
      currentRow.push(currentField);
      currentField = '';
    } else if (ch === '\r' && next === '\n') {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      i += 1;
    } else if (ch === '\n' || ch === '\r') {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += ch;
    }
  }

  // Push final field/row unless text ended cleanly with a trailing newline
  if (inQuotes || currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Parse CSV text into structured headers and data rows.
 * Normalizes column counts across uneven rows.
 * @param {string} rawText
 * @param {boolean} [hasHeader=true]
 * @returns {{ headers: string[], rows: string[][], columnCount: number }}
 */
export function parseCsv(rawText, hasHeader = true) {
  const matrix = parseCsvMatrix(rawText);
  if (matrix.length === 0) {
    return { headers: [], rows: [], columnCount: 0 };
  }

  const columnCount = matrix.reduce((max, r) => Math.max(max, r.length), 0);
  const padRow = (row) => {
    if (row.length === columnCount) return row;
    return [...row, ...Array(columnCount - row.length).fill('')];
  };

  if (hasHeader) {
    const headers = padRow(matrix[0]).map((h, idx) => (h.trim() ? h : `Column ${idx + 1}`));
    const rows = matrix.slice(1).map(padRow);
    return { headers, rows, columnCount };
  }

  const headers = Array.from({ length: columnCount }, (_, idx) => `Column ${idx + 1}`);
  const rows = matrix.map(padRow);
  return { headers, rows, columnCount };
}

/**
 * Escape a single CSV cell per RFC-4180.
 * @param {string} value
 * @returns {string}
 */
export function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serialize headers and rows back into a valid CSV string.
 * @param {string[]} headers
 * @param {string[][]} rows
 * @param {boolean} [includeHeader=true]
 * @returns {string}
 */
export function serializeCsv(headers, rows, includeHeader = true) {
  const lines = [];
  if (includeHeader && headers.length > 0) {
    lines.push(headers.map(escapeCsvCell).join(','));
  }
  for (const row of rows) {
    lines.push(row.map(escapeCsvCell).join(','));
  }
  return lines.join('\n');
}
