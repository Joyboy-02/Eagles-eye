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
    <section className="rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 p-4 sm:p-5 flex flex-col gap-4 shadow-xl shadow-black/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => onChangeInputMode('text')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              inputMode === 'text'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Raw Text
          </button>
          <button
            type="button"
            onClick={() => onChangeInputMode('file')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              inputMode === 'file'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {inputMode === 'file' ? 'Load Sample CSV' : 'Load Sample Data'}
          </button>
          {inputMode === 'text' && (
            <button
              type="button"
              onClick={onLoadSampleCsv}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition cursor-pointer"
              title="Switch to CSV mode with sample CSV data"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-violet-600" />
              Sample CSV
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
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
            className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none p-3.5 text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 resize-y leading-relaxed"
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
                ? 'border-violet-500 bg-violet-50'
                : 'border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/40'
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
            <Upload className="w-7 h-7 text-violet-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              {uploadedFileName
                ? `Loaded: ${uploadedFileName}`
                : 'Drop a .txt or .csv file here, or click to browse'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports quoted CSV fields, escaped quotes, and embedded newlines — read via browser FileReader API.
            </p>
          </div>

          {fileError && (
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {fileError}
            </p>
          )}
        </div>
      )}

      {isCsvMode && csvHeaders.length > 0 && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-semibold text-slate-800">
                CSV Column Sanitization ({csvRowCount} data rows · {csvHeaders.length} columns)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={csvHasHeader}
                  onChange={(e) => onToggleCsvHasHeader(e.target.checked)}
                  className="accent-violet-600 rounded cursor-pointer"
                />
                First row is header
              </label>
              <button
                type="button"
                onClick={onSelectAllColumns}
                className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={onClearColumns}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
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
                      ? 'bg-violet-50 text-violet-800 border-violet-300 font-medium'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-violet-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
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
