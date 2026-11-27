import { useMemo, useState } from 'react';
import {
  DEFAULT_ENABLED_CATEGORIES,
  detectPII,
} from '../utils/piiDetector.js';
import {
  createPseudonymRegistry,
  redactText,
  REDACTION_MODES,
} from '../utils/redactor.js';
import { parseCsv } from '../utils/csvParser.js';
import { sanitizeCsvData } from '../utils/csvSanitizer.js';
import { SAMPLE_CSV_TEXT, SAMPLE_RAW_TEXT } from '../utils/sampleData.js';
import { InputPanel } from '../components/InputPanel.jsx';
import { ControlsPanel } from '../components/ControlsPanel.jsx';
import { AuditSummary } from '../components/AuditSummary.jsx';
import { SideBySideDiff } from '../components/SideBySideDiff.jsx';

function triggerBrowserDownload(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DetectorPage() {
  const [inputMode, setInputMode] = useState('text');
  const [fileKind, setFileKind] = useState('txt');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [rawText, setRawText] = useState(SAMPLE_RAW_TEXT);

  const [csvHasHeader, setCsvHasHeader] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const [redactionMode, setRedactionMode] = useState(REDACTION_MODES.PARTIAL);
  const [enabledCategories, setEnabledCategories] = useState(DEFAULT_ENABLED_CATEGORIES);
  const [aadhaarFormatOnly, setAadhaarFormatOnly] = useState(false);
  const [customRules, setCustomRules] = useState([
    {
      id: 'sample_emp_id',
      name: 'USER',
      pattern: 'EMP-\\d{4}',
      isRegex: true,
      caseSensitive: false,
      enabled: true,
    },
  ]);

  const isCsvMode = inputMode === 'file' && fileKind === 'csv';

  const parsedCsvPreview = useMemo(() => {
    if (!isCsvMode) return { headers: [], rows: [], columnCount: 0 };
    return parseCsv(rawText, csvHasHeader);
  }, [isCsvMode, rawText, csvHasHeader]);

  const activeSelectedColumns = useMemo(() => {
    if (!isCsvMode) return [];
    const maxCols = parsedCsvPreview.headers.length;
    if (maxCols === 0) return [];
    return selectedColumns.filter((idx) => idx >= 0 && idx < maxCols);
  }, [isCsvMode, parsedCsvPreview.headers.length, selectedColumns]);

  const detectionOptions = useMemo(
    () => ({ enabledCategories, aadhaarFormatOnly, customRules }),
    [enabledCategories, aadhaarFormatOnly, customRules]
  );

  const textPipeline = useMemo(() => {
    if (isCsvMode) return null;
    const detection = detectPII(rawText, detectionOptions);
    const registry =
      redactionMode === REDACTION_MODES.PSEUDONYM ? createPseudonymRegistry() : null;
    const redacted = redactText(rawText, detection.matches, redactionMode, registry);
    return { detection, redacted, registry };
  }, [isCsvMode, rawText, detectionOptions, redactionMode]);

  const csvPipeline = useMemo(() => {
    if (!isCsvMode) return null;
    return sanitizeCsvData({
      rawCsv: rawText,
      hasHeader: csvHasHeader,
      selectedColumns: activeSelectedColumns,
      detectionOptions,
      mode: redactionMode,
    });
  }, [isCsvMode, rawText, csvHasHeader, activeSelectedColumns, detectionOptions, redactionMode]);

  const counts = isCsvMode ? csvPipeline.counts : textPipeline.detection.counts;
  const totalDetected = isCsvMode ? csvPipeline.totalDetected : textPipeline.detection.totalDetected;
  const rejectedCounts = isCsvMode ? csvPipeline.rejectedCounts : textPipeline.detection.rejectedCounts;
  const totalRejected = isCsvMode ? csvPipeline.totalRejected : textPipeline.detection.totalRejected;
  const rejectedSamples = isCsvMode ? csvPipeline.rejectedSamples : textPipeline.detection.rejectedSamples;
  const customRuleErrors = isCsvMode ? csvPipeline.customRuleErrors : textPipeline.detection.customRuleErrors;
  const activeRegistry = isCsvMode ? csvPipeline.pseudonymRegistry : textPipeline.registry;
  const pseudonymCount = activeRegistry ? activeRegistry.size() : 0;
  const sanitizedOutput = isCsvMode ? csvPipeline.sanitizedCsv : textPipeline.redacted.sanitizedText;

  const handleFileLoaded = ({ name, kind, content }) => {
    setUploadedFileName(name);
    setFileKind(kind);
    setRawText(content);
    setInputMode('file');
    if (kind === 'csv') {
      const parsed = parseCsv(content, csvHasHeader);
      setSelectedColumns(parsed.headers.map((_, idx) => idx));
    }
  };

  const handleLoadSampleText = () => {
    setInputMode('text');
    setFileKind('txt');
    setUploadedFileName('');
    setRawText(SAMPLE_RAW_TEXT);
  };

  const handleLoadSampleCsv = () => {
    setInputMode('file');
    setFileKind('csv');
    setUploadedFileName('sample_customers.csv');
    setRawText(SAMPLE_CSV_TEXT);
    const parsed = parseCsv(SAMPLE_CSV_TEXT, csvHasHeader);
    setSelectedColumns(parsed.headers.map((_, idx) => idx));
  };

  const handleClear = () => {
    setRawText('');
    setUploadedFileName('');
    setSelectedColumns([]);
    if (inputMode === 'file') setFileKind('txt');
  };

  const handleToggleCsvHasHeader = (nextHasHeader) => {
    setCsvHasHeader(nextHasHeader);
    const parsed = parseCsv(rawText, nextHasHeader);
    setSelectedColumns(parsed.headers.map((_, idx) => idx));
  };

  const handleToggleColumn = (colIdx) => {
    setSelectedColumns((prev) =>
      prev.includes(colIdx) ? prev.filter((i) => i !== colIdx) : [...prev, colIdx]
    );
  };

  const handleCopyOutput = async () => {
    if (!sanitizedOutput) return false;
    try { await navigator.clipboard.writeText(sanitizedOutput); return true; }
    catch { return false; }
  };

  const handleDownloadSanitized = () => {
    if (!sanitizedOutput) return;
    if (isCsvMode) {
      const base = uploadedFileName ? uploadedFileName.replace(/\.csv$/i, '') : 'sanitized_data';
      triggerBrowserDownload(`${base}_sanitized.csv`, sanitizedOutput, 'text/csv;charset=utf-8');
    } else {
      const base = uploadedFileName ? uploadedFileName.replace(/\.txt$/i, '') : 'sanitized_text';
      triggerBrowserDownload(`${base}_sanitized.txt`, sanitizedOutput, 'text/plain;charset=utf-8');
    }
  };

  const handleDownloadAuditJson = () => {
    const auditPayload = {
      generatedAt: new Date().toISOString(),
      executionEnvironment: '100% Client-Side Browser Memory',
      inputType: isCsvMode ? 'csv' : 'text',
      ...(isCsvMode
        ? { csvSummary: { totalRows: parsedCsvPreview.rows.length, totalColumns: parsedCsvPreview.headers.length, sanitizedColumnNames: activeSelectedColumns.map((idx) => parsedCsvPreview.headers[idx]) } }
        : { characterCount: rawText.length }),
      configuration: { redactionMode, aadhaarVerhoeffStrict: !aadhaarFormatOnly, luhnStrict: true, enabledCategories, activeCustomRuleCount: customRules.filter((r) => r.enabled).length },
      summary: { totalVerifiedPII: totalDetected, countsByCategory: counts, totalRejectedFalsePositives: totalRejected, rejectedByCategory: rejectedCounts, rejectedReasons: rejectedSamples.map((s) => ({ category: s.category, reason: s.reason, ...(s.column ? { column: s.column, row: s.row } : {}) })) },
    };
    triggerBrowserDownload('pii_audit_summary.json', JSON.stringify(auditPayload, null, 2), 'application/json;charset=utf-8');
  };

  const handleExportPseudonyms = () => {
    if (!activeRegistry || activeRegistry.size() === 0) return;
    triggerBrowserDownload('pseudonym_session_mapping.json', JSON.stringify(activeRegistry.toJSON(), null, 2), 'application/json;charset=utf-8');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-16">
      {/* Section header */}
      <div className="border-b border-slate-800/60 bg-slate-900/50 px-4 sm:px-6 py-4">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-50">PII Detector</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste text or upload a file — detection, redaction, and exports run 100% in your browser.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            100% Client-Side / Zero Data Leaves Browser
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 flex flex-col gap-5">
        <InputPanel
          inputMode={inputMode}
          onChangeInputMode={(mode) => { setInputMode(mode); if (mode === 'text' && fileKind === 'csv') setFileKind('txt'); }}
          rawText={rawText}
          onChangeRawText={setRawText}
          uploadedFileName={uploadedFileName}
          onFileLoaded={handleFileLoaded}
          onLoadSampleText={handleLoadSampleText}
          onLoadSampleCsv={handleLoadSampleCsv}
          onClear={handleClear}
          isCsvMode={isCsvMode}
          csvHeaders={parsedCsvPreview.headers}
          csvRowCount={parsedCsvPreview.rows.length}
          csvHasHeader={csvHasHeader}
          onToggleCsvHasHeader={handleToggleCsvHasHeader}
          selectedColumns={activeSelectedColumns}
          onToggleColumn={handleToggleColumn}
          onSelectAllColumns={() => setSelectedColumns(parsedCsvPreview.headers.map((_, idx) => idx))}
          onClearColumns={() => setSelectedColumns([])}
        />

        <ControlsPanel
          redactionMode={redactionMode}
          onChangeMode={setRedactionMode}
          enabledCategories={enabledCategories}
          onToggleCategory={(id) => setEnabledCategories((prev) => ({ ...prev, [id]: !prev[id] }))}
          aadhaarFormatOnly={aadhaarFormatOnly}
          onToggleAadhaarFormatOnly={setAadhaarFormatOnly}
          customRules={customRules}
          onAddCustomRule={({ name, pattern, isRegex, caseSensitive }) =>
            setCustomRules((prev) => [...prev, { id: `rule_${Date.now()}`, name, pattern, isRegex, caseSensitive, enabled: true }])
          }
          onToggleCustomRule={(id) => setCustomRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r))}
          onDeleteCustomRule={(id) => setCustomRules((prev) => prev.filter((r) => r.id !== id))}
          customRuleErrors={customRuleErrors}
          counts={counts}
          pseudonymCount={pseudonymCount}
          onExportPseudonyms={handleExportPseudonyms}
        />

        <AuditSummary
          totalDetected={totalDetected}
          totalRejected={totalRejected}
          counts={counts}
          rejectedCounts={rejectedCounts}
          rejectedSamples={rejectedSamples}
          redactionMode={redactionMode}
          pseudonymCount={pseudonymCount}
          hasOutput={Boolean(rawText)}
          isCsvMode={isCsvMode}
          onCopyOutput={handleCopyOutput}
          onDownloadSanitized={handleDownloadSanitized}
          onDownloadAuditJson={handleDownloadAuditJson}
          onExportPseudonyms={handleExportPseudonyms}
        />

        <SideBySideDiff
          isCsvMode={isCsvMode}
          rawText={rawText}
          textSegments={isCsvMode ? [] : textPipeline.redacted.segments}
          sanitizedText={sanitizedOutput}
          csvResult={csvPipeline || { headers: [], cellDiffs: [] }}
          selectedColumns={activeSelectedColumns}
        />
      </main>

      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        All scanning, Luhn/Verhoeff checksum validation, pseudonymization, and exports execute 100% locally inside your browser. Zero bytes are transmitted over the network.
      </footer>
    </div>
  );
}
