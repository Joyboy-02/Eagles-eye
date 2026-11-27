import { useRef, useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Trash2,
  Table2,
  CheckSquare,
  Square,
  FileSpreadsheet,
} from 'lucide-react';

export function InputPanel({
  inputMode,
  onChangeInputMode,
  rawText,
  onChangeRawText,
  uploadedFileName,
  onFileLoaded,
  onLoadSampleText,
  onLoadSampleCsv,
  onClear,
  isCsvMode,
  csvHeaders,
  csvRowCount,
  csvHasHeader,
  onToggleCsvHasHeader,
  selectedColumns,
  onToggleColumn,
  onSelectAllColumns,
  onClearColumns,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.txt') && !lowerName.endsWith('.csv')) {
      setFileError('Only .txt and .csv files are supported.');
      return;
    }
    setFileError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = typeof e.target?.result === 'string' ? e.target.result : '';
      const kind = lowerName.endsWith('.csv') ? 'csv' : 'txt';
      onFileLoaded({ name: file.name, kind, content });
    };
    reader.onerror = () => {
      setFileError('Failed to read file locally.');
    };
    reader.readAsText(file);
  };

  return (
    <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5 flex flex-col gap-4 shadow-xl shadow-slate-950/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => onChangeInputMode('text')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              inputMode === 'text'
                ? 'bg-slate-800 text-slate-50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Raw Text
          </button>
          <button
            type="button"
            onClick={() => onChangeInputMode('file')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              inputMode === 'file'
                ? 'bg-slate-800 text-slate-50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload .txt / .csv
          </button>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={inputMode === 'file' ? onLoadSampleCsv : onLoadSampleText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 hover:bg-emerald-500/25 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {inputMode === 'file' ? 'Load Sample CSV' : 'Load Sample Data'}
          </button>
          {inputMode === 'text' && (
            <button
              type="button"
              onClick={onLoadSampleCsv}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/80 transition cursor-pointer"
              title="Switch to CSV mode with sample CSV data"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              Sample CSV
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-500/40 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {inputMode === 'text' ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={rawText}
            onChange={(e) => onChangeRawText(e.target.value)}
            placeholder="Paste raw logs, customer records, emails, PAN/Aadhaar numbers, credit cards, or IPs here. Nothing leaves your browser..."
            rows={9}
            spellCheck={false}
            className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 outline-none p-3.5 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-500 resize-y leading-relaxed"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {rawText.length.toLocaleString()} characters ·{' '}
              {rawText ? rawText.split(/\r?\n/).length : 0} lines
            </span>
            <span>Parsed locally in memory</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-slate-700 bg-slate-950/70 hover:border-slate-500 hover:bg-slate-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,text/plain,text/csv"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <Upload className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-200">
              {uploadedFileName
                ? `Loaded: ${uploadedFileName}`
                : 'Drop a .txt or .csv file here, or click to browse'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports quoted CSV fields, escaped quotes, and embedded newlines — read via browser FileReader API.
            </p>
          </div>

          {fileError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
              {fileError}
            </p>
          )}
        </div>
      )}

      {isCsvMode && csvHeaders.length > 0 && (
        <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">
                CSV Column Sanitization ({csvRowCount} data rows · {csvHeaders.length} columns)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={csvHasHeader}
                  onChange={(e) => onToggleCsvHasHeader(e.target.checked)}
                  className="accent-emerald-500 rounded cursor-pointer"
                />
                First row is header
              </label>
              <button
                type="button"
                onClick={onSelectAllColumns}
                className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={onClearColumns}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                None
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {csvHeaders.map((header, idx) => {
              const isSelected = selectedColumns.includes(idx);
              return (
                <button
                  key={`${idx}-${header}`}
                  type="button"
                  onClick={() => onToggleColumn(idx)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="font-mono">{header}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500">
            Only selected columns are scanned and redacted; unselected columns remain untouched.
          </p>
        </div>
      )}
    </section>
  );
}
