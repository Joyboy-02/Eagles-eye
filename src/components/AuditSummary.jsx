import { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  FileJson,
  ShieldCheck,
  FilterX,
  KeyRound,
} from 'lucide-react';
import { CATEGORY_META } from '../utils/piiDetector.js';
import { CATEGORY_STYLES } from '../utils/categoryStyles.js';
import { REDACTION_MODES } from '../utils/redactor.js';

export function AuditSummary({
  totalDetected,
  totalRejected,
  counts,
  rejectedCounts,
  rejectedSamples,
  redactionMode,
  pseudonymCount,
  hasOutput,
  isCsvMode,
  onCopyOutput,
  onDownloadSanitized,
  onDownloadAuditJson,
  onExportPseudonyms,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await onCopyOutput();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <section className="rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 p-4 sm:p-5 flex flex-col gap-4 shadow-xl shadow-black/10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Verified PII Detected
              </div>
              <div className="text-xl font-bold text-slate-800 font-mono">
                {totalDetected}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <FilterX className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Rejected False Positives
              </div>
              <div className="text-xl font-bold text-amber-700 font-mono">
                {totalRejected}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                {redactionMode === REDACTION_MODES.PSEUDONYM
                  ? 'Unique Pseudonyms'
                  : 'Active Redaction Mode'}
              </div>
              <div className="text-base font-bold text-violet-700 font-mono capitalize">
                {redactionMode === REDACTION_MODES.PSEUDONYM
                  ? `${pseudonymCount} tokens`
                  : `${redactionMode} mask`}
              </div>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!hasOutput}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Output</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDownloadSanitized}
            disabled={!hasOutput}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-md shadow-violet-500/25"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {isCsvMode ? '.csv' : '.txt'}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadAuditJson}
            disabled={!hasOutput}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            title="Downloads counts & metadata only — zero raw PII"
          >
            <FileJson className="w-3.5 h-3.5 text-violet-300" />
            <span>Audit Summary (.json)</span>
          </button>

          {redactionMode === REDACTION_MODES.PSEUDONYM && (
            <button
              type="button"
              onClick={onExportPseudonyms}
              disabled={pseudonymCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Pseudonyms (.json)</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Breakdown & Rejected False-Positives Details */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mr-1">
            By Category:
          </span>
          {Object.values(CATEGORY_META).map((meta) => {
            const c = counts[meta.id] ?? 0;
            const style = CATEGORY_STYLES[meta.id];
            return (
              <span
                key={meta.id}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] ${
                  c > 0
                    ? style.badge
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <span>{meta.shortLabel}:</span>
                <strong className="font-mono">{c}</strong>
              </span>
            );
          })}
        </div>

        {totalRejected > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-amber-800">
            <span className="text-slate-500">Rejected details:</span>
            {Object.entries(rejectedCounts)
              .filter(([, count]) => count > 0)
              .map(([cat, count]) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 font-mono"
                  title={rejectedSamples
                    .filter((s) => s.category === cat)
                    .map((s) => `${s.maskedPreview}: ${s.reason}`)
                    .join('\n')}
                >
                  {CATEGORY_META[cat]?.shortLabel || cat}: {count} rejected
                </span>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
